const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const Review = require('./reviewModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a Name"],
        unique: true,
        trim: true,
        maxlength:[40, 'A tour name must have more or equal 40 Character'],
        minlenght: [10, "A tour name must have less or equal 40 Character"],
        // validate:[validator.isAlpha, 'Tour name must contain charact']
    },
    slug:{
        type:String
    },
    duration:{
      type: Number,
      required:[true, 'A tour duration is required']  
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A group size required']
    },
    difficulty:{
        type: String,
        required: [true, 'A group difficult must have'],
        enum:{
            values:['easy', 'medium', 'difficult'],
            message:'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min:[1, "Rating must be above 1.0"],
        max:[5, "Rating maust be below 5.0"],
        set: value => Math.round(value * 10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a Price"]
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                // this only points to current doc on new documents creation not update
                return val < this.price; //100< 200=true , 250<200 = false
            },
            message:'Discount price({VALUE}) should be below regular price'

        } 
    },
    summary:{
        type: String,
        trim: true,
        required: [true, 'A discription must have']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover:{
        type: String,
        required: [true, "A tour image is required"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select:false
    },
    startDates: [Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation: {
        //GeoJSON
        type:{
            type:String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        address:String,
        description: String
    },
    locations:[
        {
            type:{
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates:[Number],
            description: String,
            day: Number,
            address: String
        }
    ],
    guides: [
        {
            //here we are referencing the userobject model data with the guides . we can use embedding see line number 129.
            type: mongoose.Schema.ObjectId, 
            ref: 'User'
        }
    ]
}, {
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref:'Review',
    foreignField: 'tour',
    localField: '_id'
});

// document middle ware, run before .save() and .create().
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next();
})

// middle ware to embeding the guides into the tours model
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     // above guide promise if full of promises so we are using promise.all..
//     this.guides = await Promise.all(guidesPromises);

//     next();
// })



// tourSchema.post('save', function(docs, next){
//     console.log(docs);
//     next();
// })

// query middleware
// regular expression, if any hook start with find.it will not show..
tourSchema.pre(/^find/, function(next){
    this.find({secretTour:{$ne:true}});
    this. start = Date.now();
    next();
})

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt'
    });
    next();
})

tourSchema.pre(/^find/, function(next){
    console.log(`query took ${Date.now() - this.start}`)
    next();
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;