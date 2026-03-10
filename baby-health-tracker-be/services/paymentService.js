const payOS = require("../configs/PayOSConfig");
const config = require("../configs/Config");
const TransactionHistory = require("../models/transaction_history");
const PointPackage = require("../models/point_package");
const Account = require("../models/accounts");
const Parents = require("../models/parents");
// Package definitions matching frontend
const PACKAGES = {
  p1: { id: "p1", name: "Gói cơ bản", points: 50, price: 100000 },
  p2: { id: "p2", name: "Gói tiêu chuẩn", points: 120, price: 200000 },
  p3: { id: "p3", name: "Gói cao cấp", points: 300, price: 500000 },
};

/**
 * Create a payment link with PayOS
 * @param {String} accountId - Account ID
 * @param {String} packageId - Point package ID (p1, p2, p3)
 * @param {String} paymentMethod - Payment method (e.g., 'payos')
 * @returns {Object} Payment link info and transaction
 */
async function createPaymentLink(
  parentId,
  accountId,
  packageId,
  paymentMethod = "payos",
) {
  try {
    // 1. Get package details from predefined packages
    console.log(
      "Creating payment link - parentId:",
      parentId,
      "accountId:",
      accountId,
      "packageId:",
      packageId,
    );
    const pointPackage = PACKAGES[packageId];
    if (!pointPackage) {
      throw new Error("Point package not found");
    }

    // 2. Get parent details
    const parent = await Parents.findById(parentId);
    if (!parent) {
      throw new Error("Parent not found");
    }

    // 3. Generate unique order code (timestamp + random)
    const orderCode = Number(String(Date.now()).slice(-9));

    // 4. Create transaction record
    const transaction = new TransactionHistory({
      point_package_id: packageId, // Store the package ID string (p1, p2, p3)
      parent_id: parentId,
      account_id: accountId,
      points: pointPackage.points,
      amount: pointPackage.price,
      receiver: parent.email || parent.phone_number || "Unknown",
      payment_method: paymentMethod,
      status: "pending",
      payos_order_code: orderCode,
      description: `Nạp ${pointPackage.points} điểm - ${pointPackage.name}`,
    });

    await transaction.save();

    // 5. Prepare PayOS payment data
    const paymentData = {
      orderCode: orderCode,
      amount: pointPackage.price,
      description: `Nap diem ${pointPackage.name}`,
      items: [
        {
          name: pointPackage.name,
          quantity: 1,
          price: pointPackage.price,
        },
      ],
      returnUrl: `${config.PAYMENT_SUCCESS_URL}?orderCode=${orderCode}`,
      cancelUrl: `${config.PAYMENT_CANCEL_URL}?orderCode=${orderCode}`,
    };

    // 6. Create payment link with PayOS
    const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);

    // 7. Update transaction with payment link info
    transaction.payos_payment_link = paymentLinkResponse.checkoutUrl;
    transaction.payos_qr_code = paymentLinkResponse.qrCode;
    await transaction.save();

    return {
      transaction_id: transaction._id,
      success: true,
      transaction_id: transaction._id,
      order_code: orderCode,
      payment_link: paymentLinkResponse.checkoutUrl,
      qr_code: paymentLinkResponse.qrCode,
      amount: pointPackage.price,
      points: pointPackage.points,
    };
  } catch (error) {
    console.error("Create payment link error:", error);
    throw error;
  }
}

/**
 * Verify payment webhook from PayOS
 * @param {Object} webhookData - Webhook data from PayOS
 * @returns {Object} Verification result
 */
async function verifyPaymentWebhook(webhookData) {
  try {
    const { orderCode, status, transactionId } = webhookData;

    // Find transaction by order code
    const transaction = await TransactionHistory.findOne({
      payos_order_code: orderCode,
    }).populate("parent_id");

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction based on payment status
    if (status === "PAID" || status === "paid") {
      transaction.status = "completed";
      transaction.payos_transaction_id = transactionId;
      transaction.transaction_date = new Date();

      // Update parent wallet points
      const parent = await Parents.findById(transaction.parent_id);
      if (parent) {
        parent.wallet_points = (parent.wallet_points || 0) + transaction.points;
        await parent.save();
      }
    } else if (status === "CANCELLED" || status === "cancelled") {
      transaction.status = "cancelled";
    } else {
      transaction.status = "failed";
    }

    await transaction.save();

    return {
      success: true,
      transaction_id: transaction._id,
      status: transaction.status,
      points_added: transaction.status === "completed" ? transaction.points : 0,
    };
  } catch (error) {
    console.error("Verify payment webhook error:", error);
    throw error;
  }
}

/**
 * Check payment status
 * @param {Number} orderCode - PayOS order code
 * @returns {Object} Payment status
 */
async function checkPaymentStatus(orderCode) {
  try {
    // Get payment info from PayOS
    const paymentInfo = await payOS.paymentRequests.get(orderCode);

    // Find transaction
    const transaction = await TransactionHistory.findOne({
      payos_order_code: orderCode,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update local transaction status if needed
    if (paymentInfo.status === "PAID" && transaction.status === "pending") {
      transaction.status = "completed";
      transaction.payos_transaction_id = paymentInfo.id;
      transaction.transaction_date = new Date();

      // Update parent wallet points
      const parent = await Parents.findById(transaction.parent_id);
      if (parent) {
        parent.wallet_points = (parent.wallet_points || 0) + transaction.points;
        await parent.save();
      }

      await transaction.save();
    }

    return {
      success: true,
      order_code: orderCode,
      status: transaction.status,
      payment_info: paymentInfo,
    };
  } catch (error) {
    console.error("Check payment status error:", error);
    throw error;
  }
}

/**
 * Cancel payment link
 * @param {Number} orderCode - PayOS order code
 * @returns {Object} Cancellation result
 */
async function cancelPaymentLink(orderCode) {
  try {
    // Cancel with PayOS
    const cancelResponse = await payOS.paymentRequests.cancel(orderCode);

    // Update transaction status
    const transaction = await TransactionHistory.findOne({
      payos_order_code: orderCode,
    });

    if (transaction) {
      transaction.status = "cancelled";
      await transaction.save();
    }

    return {
      success: true,
      order_code: orderCode,
      status: "cancelled",
    };
  } catch (error) {
    console.error("Cancel payment link error:", error);
    throw error;
  }
}

/**
 * Get transaction history for an account
 * @param {String} accountId - Account ID
 * @returns {Array} Transaction history
 */
async function getTransactionHistory(parentId) {
  try {
    const transactions = await TransactionHistory.find({
      parent_id: parentId,
    })
      .populate("point_package_id")
      .sort({ created_at: -1 });

    return transactions;
  } catch (error) {
    console.error("Get transaction history error:", error);
    throw error;
  }
}

/**
 * Update transaction status
 * @param {String} transactionId - Transaction ID
 * @param {String} newStatus - New status (pending, completed, failed, cancelled)
 * @returns {Object} Updated transaction
 */
async function updateTransactionStatus(transactionId, newStatus) {
  try {
    const validStatuses = ["pending", "completed", "failed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const transaction = await TransactionHistory.findById(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    console.log(
      `Updating transaction ${transactionId} status from ${transaction.status} to ${newStatus}`,
    );

    // If changing to completed, update parent wallet points
    if (newStatus === "completed" && transaction.status !== "completed") {
      const parent = await Parents.findById(transaction.parent_id);
      if (parent) {
        parent.wallet_points = (parent.wallet_points || 0) + transaction.points;
        await parent.save();
      } else {
        console.warn("Parent not found for transaction:", transactionId);
      }
      transaction.transaction_date = new Date();
    }

    transaction.status = newStatus;
    await transaction.save();

    return transaction;
  } catch (error) {
    console.error("Update transaction status error:", error);
    throw error;
  }
}

module.exports = {
  createPaymentLink,
  verifyPaymentWebhook,
  checkPaymentStatus,
  cancelPaymentLink,
  getTransactionHistory,
  updateTransactionStatus,
};
