const express = require('express');
const router = express.Router();
const fs = require('fs');
const doctorController = require('../../controllers/front/doctorController');
const authController = require('../../controllers/authenticationController');
// param middleware
// router.param('id', doctorController.checkId);

router.route('/').get(doctorController.getAllDoctors);
router.route('/:id').get(doctorController.getDoctor);
module.exports = router;