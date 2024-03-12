if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const { required } = require("joi");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const dbUrl = process.env.DB_URL || `mongodb://localhost:27017/yelp-camp`; //;

//create or connect to db yelpcamp
// `mongodb://localhost:27017/yelp-camp`
mongoose.connect(dbUrl);

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

// use sanitize to avoid nosql-injections
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("Session Store Error");
});

// session
const sessionConfig = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash()); // used to send messages after an action has taken place
// secure Express apps by setting HTTP response headers
app.use(helmet());

const scriptSrcUrls = [
  "https://www.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://www.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dfjiffoxv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// passport config
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
  res.render("home");
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
  console.log("Listening on Port 3000");
});
