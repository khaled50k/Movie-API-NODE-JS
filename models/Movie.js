const mongoose = require("mongoose");
const Movie = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Movie", Movie);