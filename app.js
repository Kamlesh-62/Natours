const express = require('express');
const morgan = require('morgan');
const AppError = require('./utilities/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const globalErrorHandler = require('./controllers/errorController')

const app = express();

// global middleWare

// set security http header
app.use(helmet())


if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// limiter ,Limit request for same aPi(rate limiter)

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "To many request from this IP, please try again in 1 hour!" 
});

app.use('/api',limiter);

// body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));

// data sanitization against nosql query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss())

//prevent parameter polution. id we use same parameter twice in url.. prevent that
app.use(hpp({
    whitelist:[
        'duration',
        'maxGroupSize',
        'maxGroupSize',
        'ratingsAverage',
        'ratingsQuantity',
        'price'
    ]
}))

// serving static files
app.use(express.static(`${__dirname}/public`))

//test middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

// =======================
// routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// route handler
app.all('*', (req, res, next) => {
    
    next(new AppError(`can not find ${req.originalUrl} on this server`, 404));
});

// error handling middleware
app.use(globalErrorHandler)

module.exports = app;

