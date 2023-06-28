// series.model.js

const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
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
  categories: {
    type: [String],
    required: true,
  },
  seasons: [seasonSchema],
});

const Series = mongoose.model("Series", seriesSchema);

module.exports = Series;
