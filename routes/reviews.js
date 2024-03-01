const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync');
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware')

const Review = require('../models/review');
const Campground = require('../models/campground');


// add new review to a camp page
router.post('/', isLoggedIn,validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Thanks for the review!')
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    // res.send('deleting review...')
    req.flash('success', 'Your feedback will be missed :(');
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;