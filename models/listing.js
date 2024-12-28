const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defaultLink =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1769&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: {
      type: String,
      default: defaultLink,
      set: (v) => (v === "" ? defaultLink : v),
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  filter: [
    {
      type: String,
      required: true,
    },
  ],
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
