const express = require('express');
const router = express.Router();
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const Campground = require('../models/campground');

router.route('/')
    // view the index page when the page is first opened
    .get(catchAsync( campgrounds.index ))
    // get new camp info from user input and save to db
    .post(isLoggedIn, upload.array('image'), validateCampground,  catchAsync( campgrounds.createCampground ))

// render form page to add a new camp
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // view a single campground in detial using its id
    .get(catchAsync( campgrounds.showCampground))
    // edit camp details
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync( campgrounds.updateCampgrounds ))
    // delete
    .delete(isLoggedIn, isAuthor, catchAsync( campgrounds.deleteCampground ))

// view the form page to edit details of a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.renderEditForm ));


module.exports = router;