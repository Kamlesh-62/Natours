const Tour = require('../models/tourModel');
const catchAsync = require('../utilities/catchAsync');

exports.getOverview = catchAsync(async(req, res, next) => {
    //get tour data from collection
    const tours = await Tour.find();

    //build template

    //render that template using tour data from first step

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
});

exports.getTour = catchAsync(async(req, res, next) => {

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        field: 'review ratings user'
    })

    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour
    })
})

exports.getLoginForm = catchAsync( (req, res, next) => {
    res.status(200).render('login',{
        title: 'Log in to your Account'
    })
})