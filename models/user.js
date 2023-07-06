const Joi = require('joi');
const mongoose = require('mongoose');
const JoiOid = require('joi-oid');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        minlength:5,
        maxlength:50
    },
    email:{
        type:String,
        required: true,
        unique:true,
        minlength:5,
        maxlength:255
    },
    password:{
        type:String,
        required: true,
        minlength:16,
        maxlength:1024 //after hashed maximum characters are 1024 so need to provide less than 1024 characters to hash
    }
});

//adding method to the userSchema to generate JWT(authentication token).
userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id},config.get('jwt.privateKey'));
    return token;
}

const User = mongoose.model('User',userSchema);


function validateUser(user){

    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email:Joi.string().min(5).max(255).required().email(),
        password:  Joi.string()
        .min(8)
        .max(25)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        'password')
    });

    return schema.validate({name:user.name,email:user.email,password:user.password});
}

function validatePutRequestInput(user){
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email:Joi.string().min(5).max(255).required().email()
    });

    return schema.validate({name:user.name,email:user.email});
}

exports.User = User;
exports.validate = validateUser;
exports.validatePutRequest = validatePutRequestInput;