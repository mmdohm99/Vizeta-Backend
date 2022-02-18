const express = require('express');
const router = express.Router();
const doctorController = require('../../controllers/backend/doctorController');
const authController = require('../../controllers/authenticationController');
// param middleware
// router.param('id', doctorController.checkId);

router
    .route('/')
    .get(authController.protect, doctorController.getAllDoctors)
    .post(authController.protect, doctorController.createDoctor);
router
    .route('/:id')
    .get(authController.protect, doctorController.getDoctor)
    .delete(authController.protect, doctorController.deleteDoctor)
    .patch(authController.protect, doctorController.updateDoctor);
module.exports = router;