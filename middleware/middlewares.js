const Listing = require("../models/listing.js");

// Login Validation
module.exports.isLoggedIn = (req, res, next) => {
  console.log(`Current User :- ${req.user}`);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

// Saving source URL
module.exports.saveRedirectUrl = async (req, res, next) => {
  try {
    if (!req.session.redirectUrl) {
      console.log(`Invalid Redirect URL:- ${req.session.redirectUrl}`);
      throw new Error();
    }
    let url = `${req.protocol}://${req.get("host")}${req.session.redirectUrl}`;
    console.log(`URL : ${url}`);
    const response = await fetch(url);
    if (response.status < 400) {
      res.locals.redirectUrl = req.session.redirectUrl;
    }
  } catch (err) {
    res.locals.redirectUrl = "/listings";
  }
  next();
};

// Owner Validation
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  console.log(
    `Listing Owner ID : ${listing.owner._id} \nCurrent user ID : ${res.locals.currUser._id}`
  );
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this Listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
