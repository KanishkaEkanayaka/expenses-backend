const express = require('express');
const auth = require('../middleware/auth');
const _ = require('lodash');
const {Category, validate} = require('../models/category');
const mongoose = require('mongoose');
const debug = require('debug')('app:users');

const router = express.Router();

//Get the current user
router.get('/',auth,async (req, res)=>{
    const categories = await Category.find();
    res.send(categories);
});

//Register new user
router.post('/',auth,async(req, res)=>{

    const { error } = validate(req.body);

    if(error) return res.status(400).send(error.message);

    let category = await Category.findOne({name:req.body.name});
    if(category) return res.status(400).send('Category already registered'); //400 -> bad request

    //simplified way to assign values to the attribute to create user object.
    category = new Category(_.pick(req.body,['name']));

    try{
        await category.save();
        debug(category + ' User saved');
        res.send(category);

    }catch(ex){
        for(errField in ex.errors){
            console.log(ex.errors[errField].message);
        }
    }
});


router.delete('/:id', auth, async(req,res)=>{
    const category = await User.findByIdAndRemove(req.params.id);
    if(!category)return res.status(400).send("Requested customer not available");

    res.send(`${_.pick(category,['name'])} removed`);
});

module.exports = router;