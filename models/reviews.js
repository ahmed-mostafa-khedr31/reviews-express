const mongoose = require("mongoose");
const reviewsSchema = new mongoose.Schema({
  // title: {
  //   type: String,
  //   required: true,
  // },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  review: {
    type: String,
    required: true,
  },
});
const Reviews = mongoose.model("Reviews", reviewsSchema);
module.exports = Reviews;
