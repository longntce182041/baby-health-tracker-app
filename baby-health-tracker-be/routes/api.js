const express = require("express");
const accountController = require("../controller/accountController");
const babyController = require("../controller/babyController");
const doctorController = require("../controller/doctorController");
const doctorScheduleController = require("../controller/doctorScheduleController");
const growthController = require("../controller/growthController");
const healthLogController = require("../controller/healthLogController");
const userController = require("../controller/userController");
const consultationController = require("../controller/consultationController");
const conversationController = require("../controller/conversationController");
const vaccinationController = require("../controller/vaccinationController");
const vaccinationScheduleController = require("../controller/vaccinationScheduleController");
const hospitalBranchController = require("../controller/hospitalBranchController");
const pointPackageController = require("../controller/pointPackageController");
const {
  authenticateToken,
  requireParent,
  requireDoctor,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", accountController.register);
router.post("/verify-otp", accountController.verifyOtp);
router.post("/login", accountController.login);
router.post("/forgot-password", accountController.forgotPassword);
router.post("/reset-password", accountController.resetPassword);
router.post("/doctors", doctorController.addDoctor);
router.post(
  "/doctor/schedules/week",
  authenticateToken,
  requireDoctor,
  doctorScheduleController.registerWeeklySchedule,
);
router.get(
  "/doctors",
  authenticateToken,
  requireParent,
  doctorController.listDoctors,
);
router.get(
  "/doctors/:doctor_id/schedule",
  authenticateToken,
  requireParent,
  doctorScheduleController.getDoctorSchedule,
);
router.get(
  "/doctors/:id",
  authenticateToken,
  requireParent,
  doctorController.viewDoctorProfileAsParent,
);
router.put(
  "/doctor/profile",
  authenticateToken,
  requireDoctor,
  doctorController.updateDoctorProfile,
);
router.get(
  "/profile/doctor",
  authenticateToken,
  requireDoctor,
  doctorController.viewDoctorProfile,
);

router.post(
  "/babies",
  authenticateToken,
  requireParent,
  babyController.addBaby,
);
router.put(
  "/babies/:id",
  authenticateToken,
  requireParent,
  babyController.updateBaby,
);
router.delete(
  "/babies/:id",
  authenticateToken,
  requireParent,
  babyController.deleteBaby,
);
router.get(
  "/babies",
  authenticateToken,
  requireParent,
  babyController.listBabies,
);
router.get(
  "/babies/share",
  authenticateToken,
  requireParent,
  babyController.getBabyByCode,
);
router.post(
  "/babies/share",
  authenticateToken,
  requireParent,
  babyController.shareBabyToParent,
);
router.get(
  "/babies/:id",
  authenticateToken,
  requireParent,
  babyController.getBabyDetail,
);
router.post(
  "/babies/:id/notes",
  authenticateToken,
  requireParent,
  babyController.addBabyNote,
);

router.post(
  "/growth-records/:baby_id",
  authenticateToken,
  requireParent,
  growthController.addGrowthRecord,
);
router.get(
  "/growth-records",
  authenticateToken,
  requireParent,
  growthController.listGrowthChart,
);
router.get(
  "/growth-records/compare",
  authenticateToken,
  requireParent,
  growthController.compareGrowthStandard,
);

router.post(
  "/consultations",
  authenticateToken,
  requireParent,
  consultationController.scheduleConsultation,
);
router.get(
  "/consultation-doctors",
  authenticateToken,
  requireParent,
  consultationController.listConsultationDoctors,
);

router.post(
  "/health-logs/:baby_id",
  authenticateToken,
  requireParent,
  healthLogController.createHealthLog,
);
router.get(
  "/health-logs",
  authenticateToken,
  requireParent,
  healthLogController.listHealthLogs,
);
router.put(
  "/health-logs/:id",
  authenticateToken,
  requireParent,
  healthLogController.updateHealthLog,
);
router.delete(
  "/health-logs/:id",
  authenticateToken,
  requireParent,
  healthLogController.deleteHealthLog,
);

router.post(
  "/conversations/send",
  authenticateToken,
  conversationController.sendMessage,
);
router.get(
  "/conversations",
  authenticateToken,
  conversationController.getConversation,
);

// router.get('/profile', authenticateToken, userController.viewProfile);
router.get(
  "/profile/parent",
  authenticateToken,
  requireParent,
  userController.viewParentProfile,
);
router.put("/profile", authenticateToken, userController.updateProfile);
router.put(
  "/profile/password",
  authenticateToken,
  userController.changePassword,
);

router.get(
  "/admin/parents",
  userController.adminListParents,
);
router.get(
  "/admin/parents/:account_id",
  userController.adminGetParentDetail,
);
router.put(
  "/admin/parents/:account_id",
  userController.adminUpdateParent,
);
router.patch(
  "/admin/parents/:account_id/status",
  userController.adminChangeParentStatus,
);

router.get(
  "/admin/doctors",
  userController.adminListDoctors,
);
router.get(
  "/admin/doctors/:account_id",
  userController.adminGetDoctorDetail,
);
router.post(
  "/admin/doctors",
  userController.adminAddDoctor,
);
router.put(
  "/admin/doctors/:account_id",
  userController.adminUpdateDoctor,
);
router.patch(
  "/admin/doctors/:account_id/status",
  userController.adminChangeDoctorStatus,
);

router.get(
  "/admin/consultations",
  consultationController.adminListConsultations,
);
router.get(
  "/admin/consultations/status",
  consultationController.adminMonitorConsultationStatus,
);
router.get(
  "/admin/consultations/:id",
  consultationController.adminGetConsultationDetail,
);
router.patch(
  "/admin/consultations/:id/assign-doctor",
  consultationController.adminAssignDoctorToConsultation,
);

router.get(
  "/admin/vaccines",
  vaccinationController.adminListVaccines,
);
router.post(
  "/admin/vaccines",
  vaccinationController.adminAddVaccine,
);
router.put(
  "/admin/vaccines/:id",
  vaccinationController.adminUpdateVaccine,
);
router.patch(
  "/admin/vaccines/:id/locations",
  vaccinationController.updateVaccineLocations,
);
router.delete(
  "/admin/vaccines/:id",
  vaccinationController.adminDeleteVaccine,
);

router.get(
  "/admin/hospital-branches",
  hospitalBranchController.listHospitalBranches,
);
router.get(
  "/admin/hospital-branches/:id",
  hospitalBranchController.getHospitalBranchDetail,
);
router.post(
  "/admin/hospital-branches",
  hospitalBranchController.addHospitalBranch,
);
router.put(
  "/admin/hospital-branches/:id",
  hospitalBranchController.updateHospitalBranch,
);
router.delete(
  "/admin/hospital-branches/:id",
  hospitalBranchController.deleteHospitalBranch,
);

router.post(
  "/vaccination-schedules",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.bookVaccinationAppointment,
);
router.get(
  "/vaccination-schedules",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.viewVaccinationSchedule,
);
router.get(
  "/vaccination-schedules/:id",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.viewVaccinationRecordDetails,
);
router.put(
  "/vaccination-schedules/:id",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.updateVaccinationRecord,
);
router.patch(
  "/vaccination-schedules/:id/complete",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.markVaccinationCompleted,
);
router.get(
  "/vaccination-schedules/:id/notes",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.viewVaccinationNotesList,
);
router.get(
  "/vaccinations",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.viewVaccineList,
);
router.get(
  "/vaccinations/:vaccine_id/locations",
  authenticateToken,
  requireParent,
  vaccinationScheduleController.viewVaccinationClinicsByVaccine,
);

// Point Package routes (no authentication required)
router.post(
  "/point-packages",
  pointPackageController.createPointPackage,
);
router.get(
  "/point-packages",
  pointPackageController.listPointPackages,
);
router.get(
  "/point-packages/:id",
  pointPackageController.getPointPackageById,
);
router.put(
  "/point-packages/:id",
  pointPackageController.updatePointPackage,
);
router.delete(
  "/point-packages/:id",
  pointPackageController.deletePointPackage,
);

module.exports = router;
