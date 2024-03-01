const {campgroundSchema, reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res,  next) => { 
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

// verify if current camp creator is current user for use in edit/delete
module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// verify if current review creator is current user for use in delete review
module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// save redirect link in locals instead of session bc it gets erased bc passport
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//server validation for campgrounds
module.exports.validateCampground = (req, res, next) => {
    // get the error object by validating the data from the form(req.body)
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        // extract the message(s)
        const msg = error.details.map(elem=>elem.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

// server validation for reviews
module.exports.validateReview = (req, res, next) => {
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