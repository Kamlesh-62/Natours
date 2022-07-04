const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel.js');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('./../utilities/appError');
const sendEmail = require('./../utilities/email');


const signToken = (id) => {

    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);
    const cookiesOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") cookiesOption.secure = true;
    res.cookie('jwt', token, cookiesOption)

    user.password = undefined

    res.status(statusCode).json({
        status: 'sucess',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    createSendToken(newUser, 201, res)
})

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    // 1 check if email and password exist
        if(!email || !password){
           return next(new AppError('please provide email and password!', 400))
        }

    // 2 chech if user exists && password it correct
        const user = await User.findOne({email}).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))){
            return next(new AppError('Incorrect email or password', 401));
        }

    // 3 if everything ok send token to client
     createSendToken(user, 200, res)

}

exports.protect = catchAsync(async(req, res, next) => {
    let token;
    // 1. getting token and check if its there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('you are not logged in, please login to get access', 401))
    }

    // 2. validate the token(varification)
     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
     console.log(decoded)


    // 3. check if user is registerd or exist

    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next( new AppError ('The use is no loger is exist', 401))
    }

    // 4. check if user change password after token(JWT) is issued 

    if (freshUser.changePasswordAfter(decoded.iat)){
        return next(new AppError(' user recentley change password please login again'));
    }
    req.user = freshUser;
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide']; role = 'user'

        if(!roles.includes(req.user.role)){
            return  next(new AppError('you do not have permission to perform this action', 403))

        }
        next()
    }
}
exports.forgotPassword = catchAsync( async (req, res, next) => {
    // get user based on posted email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next( new AppError('There is no user with email address', 404))
    }

    //generate random reset token

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`

    const message = `Forgot your passoword? submit a patch req with your new passoword and password confirm to ${resetURL}. \nIf you don't forget password, please ignore this email`

    try{

        await sendEmail({
            email: user.email,
            subject: `Your password reset token(Valid for 10 min)`,
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new AppError('there was an error sending me to email', 500))
    }
})

exports.resetPassword =  catchAsync(async (req, res, next) => {
    //1) get user based on token
    const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hasedToken,
        passwordResetExpire: { $gt: Date.now() }
    });
    
    //2) if token has not expired, and there is user, set the new password
    if(!user){
        return next( new AppError('Token is unvalid or Expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    //3) update changePasswordAt property for the user

    //4) log the user in, send JWT
    createSendToken(user, 201, res)
})

exports.updatePassword = catchAsync( async(req,res,next) => {
    // get user from collection
    const user = await User.findById(req.user.id).select('+password')// we dont have password in mongodb data base so we ask for password by +password...
    if(!user){
        return next(new AppError('Invalid user'))
    }
    // check is posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is incorrect', 401))
    }
    //if password is correct update the password

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save();

    // log the user in with send JWt
    createSendToken(user, 201, res)
    
})


