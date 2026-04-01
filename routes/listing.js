const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
// Index Route
.get(wrapAsync(listingController.index)) 
// create route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );  

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
 // SHOW Route
.get(wrapAsync(listingController.showListing))
// update route
.put(isLoggedIn, isOwner ,validateListing, wrapAsync(listingController.updateListing)) 
 // delete route 
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
 
// edit route
router.get("/:id/edit",isLoggedIn, isOwner ,wrapAsync(listingController.renderEditForm));

module.exports = router;