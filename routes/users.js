const express = require('express');
const auth = require('../middleware/auth');
const _ = require('lodash');
const {User, validate, validatePutRequest} = require('../models/user');
const mongoose = require('mongoose');
const debug = require('debug')('app:users');
const bcrypt = require('bcrypt');

const router = express.Router();

//Get the current user
router.get('/me',auth, async (req, res)=>{
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.get('/aa',(req,res)=>{
    res.render('home.ejs');
})

//Register new user
router.post('/',async(req, res)=>{

    const { error } = validate(req.body);

    if(error) return res.status(400).send(error.message);

    let user = await User.findOne({email:req.body.email});
    if(user) return res.status(400).send('User already registered'); //400 -> bad request

    //simplified way to assign values to the attribute to create user object.
    user = new User(_.pick(req.body,['name','email','password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);

    try{
        await user.save();
        debug(user + ' User saved');

        //when the user registered, we send them a jason web token in the header of the response
        const token = user.generateAuthToken();
        res.header('x-auth-token',token).send(_.pick(user,['name','email']));

    }catch(ex){
        for(errField in ex.errors){
            console.log(ex.errors[errField].message);
        }
    }
});

router.put('/:id', auth,async(req,res)=>{

    // validating the inputs from the body
    const result = validatePutRequest(req.body);
    if(result.error){
        res.status(400).send(result.error.message);
        return;
    }
        const user = await User.findByIdAndUpdate(req.params.id,{name:req.body.name,phone:req.body.email},{new:true});
        if(!user)return res.status(400).send("Requested user not available");
        res.send(_.pick(user,['name','email']));
});

router.delete('/:id', auth, async(req,res)=>{
    const user = await User.findByIdAndRemove(req.params.id);
    if(!user)return res.status(400).send("Requested customer not available");

    res.send(_.pick(user,['name','email'])+'removed');
});

module.exports = router;