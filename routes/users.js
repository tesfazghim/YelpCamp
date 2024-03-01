const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user");
const catchAsync = require('../utils/catchAsync');

const { storeReturnTo } = require('../middleware');

// show register page
router.get("/register", (req, res) => {
  res.render("users/register");
});

// get user input and add to users db
router.post('/register',catchAsync( async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds');
        })
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

// show login page
router.get('/login', (req, res)=>{
    res.render('users/login')
})

// confirm user identity and log them in
router.post('/login', storeReturnTo,
    passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),
    (req, res) => {
        req.flash('success', 'Welcome back');
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        res.redirect(redirectUrl);
})

// logout
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 

module.exports = router;
