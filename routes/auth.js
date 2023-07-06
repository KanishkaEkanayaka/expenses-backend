const express = require('express');
const _ = require('lodash');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const Joi = require('joi');
const debug = require('debug')('app:auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// router.get('/',async (req, res)=>{
//     const users = await User.find().sort({name:1});
//     res.send(users);
// });

router.post('/', async(req, res)=>{

    const { error } = validate(req.body);

    if(error) return res.status(400).send(error.message);

    let user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send('Invalid email or password'); //400 -> bad request

    //compare the user inputted password with the password that in the database
    const validPassword =await bcrypt.compare(req.body.password,user.password);
    debug(`Authenticated:${validPassword}`);
    if(!validPassword) return res.status(400).send("Inavalid email or password");

    //creating jwt token
    const token = user.generateAuthToken();
    res.header('x-auth-token',token).send(_.pick(user,['name','email']));

});

//validate the user inputs that given as authentication data
function validate(req){

        const schema = Joi.object({
            email:Joi.string().min(5).max(255).required().email(),
            password:  Joi.string()
            .min(8)
            .max(25)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
            'password')
        });
    
        return schema.validate({email:req.email,password:req.password});
}

module.exports = router;