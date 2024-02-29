const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Review = require('../models/review');
const Campground = require('../models/campground');

const {reviewSchema} = require('../schemas');


// server validation for reviews
const validateReview = (req, res, next) => {
    // get the error object by validating the data from the form(req.body)
    const {error} = reviewSchema.validate(req.body);
    if (error){
        // extract the message(s)
        const msg = error.details.map(elem=>elem.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

// add new review to a camp page
router.post('/',validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Thanks for the review!')
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

//delete review
router.delete('/:reviewId',catchAsync( async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    // res.send('deleting review...')
    req.flash('success', 'Your feedback will be missed :(');
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;