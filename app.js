const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const { required } = require("joi");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//create or connect to db yelpcamp
mongoose.connect(`mongodb://localhost:27017/yelp-camp`);

//check connection status
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("YelpCamp Database connected");
});

const app = express();

app.engine("ejs", ejsMate); // use the ejs mate package for cleaner templates
app.set("view engine", "ejs"); //use ejs that was installed using npm
app.set("views", path.join(__dirname, "views")); //use the ejs files in the given folder

app.use(express.urlencoded({ extended: true })); //parse req body
app.use(methodOverride("_method"));

// serve public files (static files; css files)
app.use(express.static(path.join(__dirname, "public")));

// session
const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash()); // used to send messages after an action has taken place

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions with this session
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// store variables to use if needed when displaying 
// includes user info and flash status
app.use((req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "meron@gmail.com", username: "meron" });
  const newUser = await User.register(user, "chicken");
});

// ROUTERS SETUP
// User routes (passport and shii)
app.use("/", userRoutes);
// campgrounds router for any request that has /campgrounds
app.use("/campgrounds", campgroundRoutes);
// reviews router for any request to /camp/id/reviews
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("yelp home");
});

// redirect to error handler for everything that doesnt exisit
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ultimate eroor handler that renders the page using the status and custom or default message
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Port http://localhost:3000/");
});
