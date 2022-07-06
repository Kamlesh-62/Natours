const express = require('express');
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getMonthlyPlan, getTourStats, getTourWithin, getDistances } = require('./../controllers/tourController')
const authController = require('./../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes')



const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)

// middleware to filter top 5 cheap...
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getTourWithin);

// /tours-within?distance=233&center=-40,45unit=mi
// /tours-within/233/center/-40,45/unit/mi

router
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances)

router
.route('/')
    .get(getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        deleteTour);

module.exports = router;
