const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');

const {campgroundSchema} = require('../schemas');

//server validation for campgrounds
const validateCampground = (req, res, next) => {
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

// view the index page when the page is first opened
router.get('/', catchAsync( async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

// render form page to add a new camp
router.get('/new', (req,res)=>{
    res.render('campgrounds/new')
})

// get new camp info from user input and save to db
router.post('/',validateCampground, catchAsync( async(req, res, next)=>{
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// view a single campground in detial using its id
router.get('/:id', catchAsync( async(req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Sorry, cannot find this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

// view the form page to edit details of a campground
router.get('/:id/edit', catchAsync( async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Sorry, cannot find this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground})  
}))

router.put('/:id',validateCampground, catchAsync( async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);

}))

// delete 
router.delete('/:id', catchAsync( async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Your campground will be missed :(');
    res.redirect('/campgrounds');
}))

module.exports = router;