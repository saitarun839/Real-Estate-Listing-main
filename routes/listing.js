// Packages
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Custom Objects
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware/middlewares.js");
const listingController = require("../controllers/listings.js");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  // 1. Index Route
  .get(wrapAsync(listingController.index))
  // 4. Create Route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),

    wrapAsync(listingController.createListing)
  );

// 2. New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search Route
router.get("/search", wrapAsync(listingController.searchListing));

router
  .route("/:id")
  // 3. Show Route
  .get(wrapAsync(listingController.showListing))
  // 6. Update Route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    wrapAsync(listingController.updateListing)
  )
  // 7. Delete Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// 5. Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router.get("/filter/:id", wrapAsync(listingController.filterListing));

module.exports = router;
