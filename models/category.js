const Joi = require('joi');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        minlength:5,
        maxlength:50
    }
});

const Category = mongoose.model('Category',categorySchema);


function validateCategory(category){
    const schema = Joi.object({
        name: Joi.string().required()
    });
    return schema.validate({name:category.name});
}

exports.Category = Category;
exports.validate = validateCategory;