let Listing = require("../models/listing.js");

let headlines = {
  all: "All Listings",
  rooms: "Rooms",
  iconiccities: "Iconic Cities",
  mountains: "Mountains",
  castles: "Castles",
  amazingpools: "Amazing Pools",
  camping: "Camping",
  farms: "Farms",
  arctic: "Arctic",
  indoors: "Indoors",
  skiing: "Skiing",
  creativeplaces: "Creative Places",
  monuments: "Monuments",
  fishing: "Fishing",
};

// 1. Index Route
module.exports.index = async (req, res) => {
  let listings = await Listing.find({});
  res.render("listings/index.ejs", { listings });
};

// 2. New Route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// 3. Show Route
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// 4. Create Route
module.exports.createListing = async (req, res, next) => {
  let listing = req.body.listing;
  let newListing = new Listing(listing);

  let url = req.file.path;
  let filename = req.file.filename;

  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  let savedListing = await newListing.save();
  console.log("New Listing Created :- ", savedListing);

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

// 5. Edit Route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_500");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 6. Update Route
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = req.body.listing;
  let newListing = await Listing.findByIdAndUpdate(id, { ...listing });

  // Check if new image is uploaded
  // If yes, then change the link to the new image.
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }

  newListing.filter = listing.filter;
  newListing.filter.push("all");

  let savedListing = await newListing.save();
  console.log("Updated Listing :- ", savedListing);

  req.flash("update", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// 7. Filter Route
module.exports.filterListing = async (req, res) => {
  let { id } = req.params;
  let listings = await Listing.find({});

  listings = listings.filter((listing) => {
    return listing.filter.includes(id);
  });

  res.render("listings/filter.ejs", { filter: headlines[id], listings });
};

// 8. Search Route
module.exports.searchListing = async (req, res) => {
  let { search } = req.query;
  search = search.split(" ");

  let searchArr = search.filter((word) => word.length >= 3);

  let regex = searchArr.map((word) => new RegExp(word, "i"));
  let listings = await Listing.find({
    $or: [
      { title: { $in: regex } },
      { location: { $in: regex } },
      { country: { $in: regex } },
      { filter: { $in: regex } },
    ],
  }).exec();

  if (searchArr.length == 0) searchArr = search;

  res.render("listings/search.ejs", { search: searchArr, listings });
};

// 9. Delete Route
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(`Listing Deleted from Database\n\n${deletedListing}`);
  req.flash("deleted", "Listing Deleted");
  res.redirect("/listings");
};
