// const express = require('express');
// const router = express.Router();
// const fs = require('fs');
// const tourController = require('./../controllers/tourController');
// const authController = require('../controllers/authenticationController');
// // param middleware
// // router.param('id', tourController.checkId);

// router
//     .route('/top-5-cheap')
//     .get(tourController.aliasTopTours, tourController.getAllTours);
// router.route('/tour-stats').get(tourController.getTourStats);
// router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// router
//     .route('/')
//     .get(authController.protect, tourController.getAllTours)
//     .post(tourController.createTour);
// router
//     .route('/:id')
//     .get(tourController.getTour)
//     .delete(tourController.deleteTour)
//     .patch(tourController.updateTour);
// module.exports = router;