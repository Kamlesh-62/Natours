const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError.js');
const factory = require('../controllers/handleFactory')

// middleware for nested route
exports.setTourUserIds = (req, res, next) => {
    // allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    
    next()
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);