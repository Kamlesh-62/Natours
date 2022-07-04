const catchAsync = require('../utilities/catchAsync.js');
const User = require('./../models/userModel.js');
const AppError = require('./../utilities/appError');
const factory = require('../controllers/handleFactory')



const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el))
        newObj[el] = obj[el]
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next()
}


exports.updateMe = async(req, res, next) => {
    //create error if user post password
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This  route is not for update password. please use /updatePassword route', 400))
    }
    
    //filtered out unwated filed which should not be updated
    const filterBody = filterObj(req.body, "name", "email");
    
    //update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
}

exports.deleteMe = catchAsync(async(req,res, next)=>{
    await User.findByIdAndUpdate(req.user.id,{
        active: false
    })
    res.status(204).json({
        status: "Success",
        data: null
    })
})


exports.createUser = (req, res) => {
    res.status(500).json({
        'status': 'error',
        'message': "This route is not Defined ! please use signup instead"
    })
}
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.updateOne(User);
// do not change password with updateuser 
exports.updateUser = factory.updateOne(User);
exports.deleteUser =factory.deleteOne(User);
