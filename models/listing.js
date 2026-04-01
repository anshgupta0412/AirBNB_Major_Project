const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const { required } = require("joi");

const ListingSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1690582417564-b31a9ad96258?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === "" ? "https://plus.unsplash.com/premium_photo-1690582417564-b31a9ad96258?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
        },
    }, 
    price: Number,
    location: String,
    country: String,
    reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review",
    }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    }
},
});

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const listing = mongoose.model("listing", ListingSchema);
module.exports = listing;

