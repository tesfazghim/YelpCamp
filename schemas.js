const Joi = require('joi');
// Joi validator attempts to validate all the imput before calling up mongoose
// build what is to be expected of the form
module.exports.campgroundSchema = Joi.object({
    //campground is the object we are sending from the client 
    // refer to new.ejs
    campground:Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        body: Joi.string().required()
        
    }).required()
})