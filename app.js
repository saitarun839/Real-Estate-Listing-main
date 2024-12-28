// Environment Variable
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// Package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Custom Objects
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

// Global variables
const mongodbStore = MongoStore.create({
  mongoUrl: process.env.ATLAS_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

mongodbStore.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store: mongodbStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// MongoDB Connection
async function main() {
  await mongoose.connect(process.env.ATLAS_URL);
}

main()
  .then((res) => {
    console.log("Successfully connected to Database\n");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.engine("ejs", ejsMate);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARES

// Flash Message
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.update = req.flash("update");
  res.locals.deleted = req.flash("deleted");
  res.locals.currUser = req.user;
  res.locals.appName = process.env.APP_NAME;
  next();
});

// ROUTES

// 1. Root Route
app.get("/", (req, res) => {
  // res.send("Hi, I am root");
  res.redirect("/listings");
});

// 2. Listing
app.use("/listings", listingRouter);

app.get("/test", (req, res) => {
  let url = `${req.protocol}://${req.get("host")}${req.session.redirectUrl}`;
  res.send(url);
});
// 4. User
app.use("/", userRouter);

// 404 Error handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handling Middleware
app.use((err, req, res, next) => {
  console.log(err);
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server is listening to http://localhost:${process.env.PORT}/listings \n`
  );
});
