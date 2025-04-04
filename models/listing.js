const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
