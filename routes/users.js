const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user");
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')
const { storeReturnTo } = require('../middleware');


router.route('/register')
    // show register page
    .get(users.renderRegister)
    // get user input and add to users db
    .post(catchAsync( users.register ));

router.route('/login')
    // show login page
    .get(users.renderLogin)

    // confirm user identity and log them in
    .post( storeReturnTo,
        passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),
        users.login
    )

// logout
router.get('/logout',users.logout); 

module.exports = router;
