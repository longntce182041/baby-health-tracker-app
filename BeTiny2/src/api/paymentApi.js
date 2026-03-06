import api from "./api";

/**
 * Create payment link
 * @param {string} packageId - Point package ID
 * @param {string} paymentMethod - Payment method (default: 'payos')
 * @returns {Promise} Payment link data
 */
export const createPayment = async (packageId, paymentMethod = "payos") => {
  try {
    const response = await api.post("/payments/create", {
      package_id: packageId,
      payment_method: paymentMethod,
    });
    return response.data;
  } catch (error) {
    console.error("Create payment error:", error);
    throw error;
  }
};

/**
 * Check payment status
 * @param {number} orderCode - PayOS order code
 * @returns {Promise} Payment status data
 */
export const checkPaymentStatus = async (orderCode) => {
  try {
    const response = await api.get(`/payments/status/${orderCode}`);
    return response.data;
  } catch (error) {
    console.error("Check payment status error:", error);
    throw error;
  }
};

/**
 * Cancel payment
 * @param {number} orderCode - PayOS order code
 * @returns {Promise} Cancellation result
 */
export const cancelPayment = async (orderCode) => {
  try {
    const response = await api.post(`/payments/cancel/${orderCode}`);
    return response.data;
  } catch (error) {
    console.error("Cancel payment error:", error);
    throw error;
  }
};

/**
 * Get transaction history
 * @returns {Promise} Transaction history array
 */
export const getTransactionHistory = async () => {
  try {
    const response = await api.get("/payments/history");
    return response.data;
  } catch (error) {
    console.error("Get transaction history error:", error);
    throw error;
  }
};

/**
 * Get all point packages
 * @returns {Promise} Point packages array
 */
export const getPointPackages = async () => {
  try {
    const response = await api.get("/point-packages");
    return response.data;
  } catch (error) {
    console.error("Get point packages error:", error);
    throw error;
  }
};
