const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
};

main()
 .then(() => {
    console.log("connected to db");
})
 .catch((err) => {
    console.log(err);
 });

const initDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({...obj,owner: "69c6d6eb4f916295aa6890cd",}));
  await Listing.insertMany(initdata.data);
  console.log("data was initialized");
};
initDB();