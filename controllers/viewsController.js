const Tour = require('../models/tourModel');
const catchAsync = require('../utilities/catchAsync');

exports.getOverview = async(req, res) => {
    //get tour data from collection
    const tours = await Tour.find();

    //build template

    //render that template using tour data from first step

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
};

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker tour'
    })
}