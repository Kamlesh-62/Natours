const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require: [true, 'Please enter your name!'],
        trim: true,
        // maxlenght: [20, 'user name must be less than 20 Characters'],
        // minlenght: [2, 'user name must be less than 20 Characters'],

    },
    email:{
        type:String,
        require:[true, 'User must have email addres'],
        unique:true,
        trim:true,
        lowercase:true,
        validate:[validator.isEmail, 'Enter a valid email']
    },
    photo:{
        type: String,
    },
    role:{
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password:{
        type: String,
        require:[true, 'enter a password'],
        // trim:true,
        minlenght:8,
        select: false
    },
    passwordConfirm:{
        type: String,
        require: [true, 'Please confirm your password'],
        trim: true,
        validate: {
            // this is only work on CREATE and  SAVE!!!
            validator: function(el){
                return el === this.password;
            },
            message:"Password are not the same"
        }
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now(),
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpire: {
        type: Date
    },
    active:{
        type: Boolean,
        default: true,
        select: false // only api builder can see
    }
   
})

// middleware 
userSchema.pre('save', async function (next) {
    //only run this function if password was actually modify 
  if(!this.isModified('password')) return next();
  
//   hash the password with the cost 12
  this.password = await bcrypt.hash(this.password, 12)
// delete the password confirmed
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew)
    return next()

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next){
    //this points to current query
    this.find({active: { $ne: false}});
    next()
})

//this is instance methos which we user for check password in the database and given by user is same or not 
userSchema.methods.correctPassword = async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        return JWTTimeStamp < changeTimeStamp;
    }

    //false means not changed
    return false;
    
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    // sha256 is algorithem
    this.passwordResetToken= crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    this.passwordResetExpire = Date.now() + 10 * 60000; // 60 millisec.

    console.log({resetToken}, this.passwordResetToken)

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
