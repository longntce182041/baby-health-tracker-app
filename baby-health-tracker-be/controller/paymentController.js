const paymentService = require("../services/paymentService");
const TransactionHistory = require("../models/transaction_history");

/**
 * Create payment link
 * POST /api/payments/create
 */
async function createPayment(req, res) {
  try {
    const { package_id, payment_method, points, amount } = req.body;
    const parent_id = req.user.parent_id; // From auth middleware
    const account_id = req.user.account_id; // From auth middleware

    if (!package_id) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
    }

    const result = await paymentService.createPaymentLink(
      parent_id,
      account_id,
      package_id,
      payment_method || "payos",
    );

    // // 4. Create transaction record
    // const transaction = new TransactionHistory({
    //   point_package_id: package_id,
    //   parent_id,
    //   account_id,
    //   points,
    //   amount,
    //   payment_method,
    //   status: "pending",
    //   description: `Nạp ${points} điểm`,
    // });

    // await transaction.save();

    res.status(200).json({
      success: true,
      message: "Payment link created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment link",
    });
  }
}

/**
 * PayOS webhook handler
 * POST /api/payments/webhook
 */
async function handleWebhook(req, res) {
  try {
    const webhookData = req.body;

    console.log("PayOS Webhook received:", webhookData);

    const result = await paymentService.verifyPaymentWebhook(webhookData);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process webhook",
    });
  }
}

/**
 * Check payment status
 * GET /api/payments/status/:orderCode
 */
async function checkStatus(req, res) {
  try {
    const { orderCode } = req.params;

    const result = await paymentService.checkPaymentStatus(Number(orderCode));

    res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Check status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check payment status",
    });
  }
}

/**
 * Cancel payment
 * POST /api/payments/cancel/:orderCode
 */
async function cancelPayment(req, res) {
  try {
    const { orderCode } = req.params;

    const result = await paymentService.cancelPaymentLink(Number(orderCode));

    res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel payment",
    });
  }
}

/**
 * Get transaction history
 * GET /api/payments/history
 */
async function getHistory(req, res) {
  try {
    const parent_id = req.user.parent_id; // From auth middleware

    const transactions = await paymentService.getTransactionHistory(parent_id);

    res.status(200).json({
      success: true,
      message: "Transaction history retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get transaction history",
    });
  }
}

/**
 * Update transaction status
 * PUT /api/payments/status/:transactionId
 */
async function updateStatus(req, res) {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const transaction = await paymentService.updateTransactionStatus(
      transactionId,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Transaction status updated successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update transaction status",
    });
  }
}

module.exports = {
  createPayment,
  handleWebhook,
  checkStatus,
  cancelPayment,
  getHistory,
  updateStatus,
};
