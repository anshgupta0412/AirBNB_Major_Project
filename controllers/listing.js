const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async (req, res) => {
    const AllListings = await Listing.find({}); 
    res.render("./listings/index.ejs", {AllListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

   const listing = await Listing.findById(id)
  .populate("owner")
  .populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  });
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
},

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    console.log(response.body.features);

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

    // try {
    //     // 🔍 Geocode location
    //     let response = await geocodingClient
    //         .forwardGeocode({
    //             query: req.body.listing.location,
    //             limit: 1,
    //         })
    //         .send();

    //     // ❌ Invalid location
    //     if (!response.body.features.length) {
    //         req.flash("error", "Invalid location!");
    //         return res.redirect("/listings/new");
    //     }

    //     // ❌ Image missing
    //     if (!req.file) {
    //         req.flash("error", "Image upload failed!");
    //         return res.redirect("/listings/new");
    //     }

    //     let url = req.file.path;
    //     let filename = req.file.filename;

    //     const geoData = response.body.features[0];

    //     // ❌ Invalid geometry
    //     if (!geoData.geometry || !geoData.geometry.coordinates) {
    //         req.flash("error", "Invalid location data!");
    //         return res.redirect("/listings/new");
    //     }

    //     // ✅ Create listing (IMPORTANT: include geometry here)
    //     const newListing = new Listing({
    //         ...req.body.listing,
    //         owner: req.user._id,
    //         image: { url, filename },
    //         geometry: {
    //             type: "Point",
    //             coordinates: geoData.geometry.coordinates,
    //         },
    //     });

    //     // 💾 Save to DB
    //     await newListing.save();
    //     console.log(newListing.geometry);
    //     req.flash("success", "New Listing Created!");
    //     res.redirect("/listings");

    // } catch (err) {
    //     next(err);
    // }

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    };
    res.render("./listings/edit.ejs", { listing });
},

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(400, "send valid data for listing");
    }
    let listing = req.body.listing;
    listing.image = {
        url: listing.image,
        filename: "listingimage"
    };
    await Listing.findByIdAndUpdate(id, listing);
    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
},

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing =  await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};

