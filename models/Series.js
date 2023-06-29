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
const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  ratings: [ratingSchema],
  comments: [commentSchema],
});

const seasonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  ratings: [ratingSchema],
  episodes: [episodeSchema],
});

const seriesSchema = new mongoose.Schema({
  title: {
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
  ratings: [ratingSchema],
  seasons: [seasonSchema],
});
const Series = mongoose.model("Series", seriesSchema);

module.exports = Series;
