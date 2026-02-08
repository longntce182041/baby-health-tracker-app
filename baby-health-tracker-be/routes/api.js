const express = require('express');
const accountsController = require('../controller/accountsController');
const babiesController = require('../controller/babiesController');
const consultationsController = require('../controller/consultationsController');
const conversationsController = require('../controller/conversationsController');
const doctorSchedulesController = require('../controller/doctorSchedulesController');
const doctorsController = require('../controller/doctorsController');
const growthRecordsController = require('../controller/growthRecordsController');
const healthLogsController = require('../controller/healthLogsController');
const notificationsController = require('../controller/notificationsController');
const parentsController = require('../controller/parentsController');
const reviewsController = require('../controller/reviewsController');
const vaccinationsController = require('../controller/vaccinationsController');
const vaccineSchedulesController = require('../controller/vaccineSchedulesController');

const router = express.Router();

router.post('/accounts', accountsController.create);
router.get('/accounts', accountsController.getAll);
router.get('/accounts/:id', accountsController.getById);
router.put('/accounts/:id', accountsController.updateById);
router.delete('/accounts/:id', accountsController.deleteById);

router.post('/babies', babiesController.create);
router.get('/babies', babiesController.getAll);
router.get('/babies/:id', babiesController.getById);
router.put('/babies/:id', babiesController.updateById);
router.delete('/babies/:id', babiesController.deleteById);

router.post('/consultations', consultationsController.create);
router.get('/consultations', consultationsController.getAll);
router.get('/consultations/:id', consultationsController.getById);
router.put('/consultations/:id', consultationsController.updateById);
router.delete('/consultations/:id', consultationsController.deleteById);

router.post('/conversations', conversationsController.create);
router.get('/conversations', conversationsController.getAll);
router.get('/conversations/:id', conversationsController.getById);
router.put('/conversations/:id', conversationsController.updateById);
router.delete('/conversations/:id', conversationsController.deleteById);

router.post('/doctor_schedules', doctorSchedulesController.create);
router.get('/doctor_schedules', doctorSchedulesController.getAll);
router.get('/doctor_schedules/:id', doctorSchedulesController.getById);
router.put('/doctor_schedules/:id', doctorSchedulesController.updateById);
router.delete('/doctor_schedules/:id', doctorSchedulesController.deleteById);

router.post('/doctors', doctorsController.create);
router.get('/doctors', doctorsController.getAll);
router.get('/doctors/:id', doctorsController.getById);
router.put('/doctors/:id', doctorsController.updateById);
router.delete('/doctors/:id', doctorsController.deleteById);

router.post('/growth_records', growthRecordsController.create);
router.get('/growth_records', growthRecordsController.getAll);
router.get('/growth_records/:id', growthRecordsController.getById);
router.put('/growth_records/:id', growthRecordsController.updateById);
router.delete('/growth_records/:id', growthRecordsController.deleteById);

router.post('/health_logs', healthLogsController.create);
router.get('/health_logs', healthLogsController.getAll);
router.get('/health_logs/:id', healthLogsController.getById);
router.put('/health_logs/:id', healthLogsController.updateById);
router.delete('/health_logs/:id', healthLogsController.deleteById);

router.post('/notifications', notificationsController.create);
router.get('/notifications', notificationsController.getAll);
router.get('/notifications/:id', notificationsController.getById);
router.put('/notifications/:id', notificationsController.updateById);
router.delete('/notifications/:id', notificationsController.deleteById);

router.post('/parents', parentsController.create);
router.get('/parents', parentsController.getAll);
router.get('/parents/:id', parentsController.getById);
router.put('/parents/:id', parentsController.updateById);
router.delete('/parents/:id', parentsController.deleteById);

router.post('/reviews', reviewsController.create);
router.get('/reviews', reviewsController.getAll);
router.get('/reviews/:id', reviewsController.getById);
router.put('/reviews/:id', reviewsController.updateById);
router.delete('/reviews/:id', reviewsController.deleteById);

router.post('/vaccinations', vaccinationsController.create);
router.get('/vaccinations', vaccinationsController.getAll);
router.get('/vaccinations/:id', vaccinationsController.getById);
router.put('/vaccinations/:id', vaccinationsController.updateById);
router.delete('/vaccinations/:id', vaccinationsController.deleteById);

router.post('/vaccine_schedules', vaccineSchedulesController.create);
router.get('/vaccine_schedules', vaccineSchedulesController.getAll);
router.get('/vaccine_schedules/:id', vaccineSchedulesController.getById);
router.put('/vaccine_schedules/:id', vaccineSchedulesController.updateById);
router.delete('/vaccine_schedules/:id', vaccineSchedulesController.deleteById);

module.exports = router;
