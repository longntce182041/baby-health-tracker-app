const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (require authentication)
router.post(
  "/create",
  authMiddleware.authenticateToken,
  paymentController.createPayment,
);
router.get(
  "/status/:orderCode",
  authMiddleware.authenticateToken,
  paymentController.checkStatus,
);
router.post(
  "/cancel/:orderCode",
  authMiddleware.authenticateToken,
  paymentController.cancelPayment,
);
router.get(
  "/history",
  authMiddleware.authenticateToken,
  paymentController.getHistory,
);
router.put(
  "/status/:transactionId",
  authMiddleware.authenticateToken,
  paymentController.updateStatus,
);

// Webhook route (no auth required - PayOS will call this)
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
