const mongoose = require('mongoose');
const Tour = require('../models/tourModel')

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required: [true, 'Review cannot be empty']
    },
    rating:{
        type:Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default : Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour' ]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true, 'Review must belong to a user']
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

reviewSchema.index({tour: 1, user: 1}, {uniquw: true});

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name'
    //     })

    this.populate({
        path: 'user',
        select: ['name', 'photo']
    })
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group:{
                _id: '$tour',
                nRating: {
                    $sum: 1
                },
                avgRating: {
                    $avg: '$rating'
                }
            }
        }
    ])

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
}

reviewSchema.post('save', function(){
    // this point to current review
    this.constructor.calcAverageRatings(this.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;