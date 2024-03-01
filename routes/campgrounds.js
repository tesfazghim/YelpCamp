const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const Campground = require('../models/campground');

// view the index page when the page is first opened
router.get('/', catchAsync( async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

// render form page to add a new camp
router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new')
})

// get new camp info from user input and save to db
router.post('/', isLoggedIn, validateCampground, catchAsync( async(req, res, next)=>{
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author =  req.user._id;
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// view a single campground in detial using its id
router.get('/:id', catchAsync( async(req, res)=>{
    // get camp detials while also retriving detials from the reviews and user table
    const campground = await Campground.findById(req.params.id)
    .populate({path:'reviews', populate:{path:'author'}})
    .populate('author');
    if(!campground){
        req.flash('error', 'Sorry, cannot find this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

// view the form page to edit details of a campground
router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync( async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Sorry, cannot find this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

// edit camp details
router.put('/:id',isLoggedIn, isAuthor, validateCampground, catchAsync( async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);

}))

// delete 
router.delete('/:id', isLoggedIn, isAuthor, catchAsync( async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Your campground will be missed :(');
    res.redirect('/campgrounds');
}))

module.exports = router;