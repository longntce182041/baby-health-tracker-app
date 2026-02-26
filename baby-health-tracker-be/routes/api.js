const express = require('express');
const accountController = require('../controller/accountController');
const babyController = require('../controller/babyController');
const growthController = require('../controller/growthController');
const healthLogController = require('../controller/healthLogController');
const userController = require('../controller/userController');
const { authenticateToken, requireParent } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', accountController.register);
router.post('/verify-otp', accountController.verifyOtp);
router.post('/login', accountController.login);
router.post('/forgot-password', accountController.forgotPassword);
router.post('/reset-password', accountController.resetPassword);

router.post('/babies', authenticateToken, requireParent, babyController.addBaby);
router.put('/babies/:id', authenticateToken, requireParent, babyController.updateBaby);
router.delete('/babies/:id', authenticateToken, requireParent, babyController.deleteBaby);
router.get('/babies', authenticateToken, requireParent, babyController.listBabies);
router.get('/babies/share', authenticateToken, requireParent, babyController.getBabyByCode);
router.post('/babies/share', authenticateToken, requireParent, babyController.shareBabyToParent);
router.get('/babies/:id', authenticateToken, requireParent, babyController.getBabyDetail);
router.post('/babies/:id/notes', authenticateToken, requireParent, babyController.addBabyNote);

router.post('/growth-records/:baby_id', authenticateToken, requireParent, growthController.addGrowthRecord);
router.get('/growth-records', authenticateToken, requireParent, growthController.listGrowthChart);
router.get('/growth-records/compare', authenticateToken, requireParent, growthController.compareGrowthStandard);

router.post('/health-logs/:baby_id', authenticateToken, requireParent, healthLogController.createHealthLog);
router.get('/health-logs', authenticateToken, requireParent, healthLogController.listHealthLogs);
router.put('/health-logs/:id', authenticateToken, requireParent, healthLogController.updateHealthLog);
router.delete('/health-logs/:id', authenticateToken, requireParent, healthLogController.deleteHealthLog);

router.get('/me', authenticateToken, userController.viewProfile);
router.put('/me', authenticateToken, userController.updateProfile);
router.put('/me/password', authenticateToken, userController.changePassword);

module.exports = router;
