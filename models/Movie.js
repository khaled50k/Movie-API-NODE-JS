const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0,
  },
});
// Create a schema for the Movie model
const movieSchema = new mongoose.Schema(
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
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    year: {
      type: Number,
      required: true,
    },
    ratings: [ratingSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Create the Movie model
const Movie = mongoose.model("Movie", movieSchema);
module.exports = { Movie };
