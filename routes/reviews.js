const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync');
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware');
const reviews = require('../controllers/reviews');

const Review = require('../models/review');
const Campground = require('../models/campground');


// add new review to a camp page
router.post('/', isLoggedIn,validateReview, catchAsync(reviews.createReview));

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( reviews.deleteReview ));

module.exports = router;