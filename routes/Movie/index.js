const express = require("express");
const router = express.Router();
const { Movie } = require("../../models/Movie");
const {
  getUserId,
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../VerifyToken/index");

router.get("/", async (req, res) => {
  const title = req.query.title ? req.query.title : "";
  const regex = new RegExp(title, "i"); // case-insensitive search

  try {
    const response = await Movie.find({ title: regex })
      .populate("categories", "name")
      .populate("ratings.user", "email")
      .populate("comments.user", "email");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { title, url, poster, story, categories, year } = req.body;

    const newMovie = new Movie({
      title,
      url,
      poster,
      story,
      categories,
      year,
    });

    const savedMovie = await newMovie.save();

    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, poster, story, categories, year } = req.body;

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        url,
        poster,
        story,
        categories,
        year,
      },
      { new: true }
    ).populate("categories", "name");

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/ratings", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, rating } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Check if the user's _id already exists in the ratings array
    const userAlreadyRated = movie.ratings.some((r) => r.user.equals(user));

    if (userAlreadyRated) {
      return res.status(400).json({ error: "User already rated this movie" });
    }

    movie.ratings.push({ user, rating });

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("categories", "name")
      .populate("ratings.user", "email")
      .populate("comments.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/:id/ratings/:ratingId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id, ratingId } = req.params;
    const { rating } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const ratingIndex = movie.ratings.findIndex((rating) => rating._id == ratingId);

    if (ratingIndex === -1) {
      return res.status(404).json({ error: "Rating not found" });
    }

    movie.ratings[ratingIndex].rating = rating;

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("categories", "name")
      .populate("ratings.user", "email")
      .populate("comments.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.delete("/:id/ratings/:ratingId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id, ratingId } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const ratingIndex = movie.ratings.findIndex(
      (rating) => rating._id == ratingId
    );

    if (ratingIndex === -1) {
      return res.status(404).json({ error: "Rating not found" });
    }

    movie.ratings.splice(ratingIndex, 1);

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("categories", "name")
      .populate("ratings.user", "email")
      .populate("comments.user", "email");

      res.status(200).json({ message: "Rating deleted successfully", movie: populatedMovie });
    } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Update the movie to add comments
router.post("/:id/comments", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, comment } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    movie.comments.push({ user, comment });

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id).populate("categories", "name").populate("ratings.user", "email")
    .populate("comments.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/:id/comments/:commentId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { comment } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const commentIndex = movie.comments.findIndex((comment) => comment._id == commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    movie.comments[commentIndex].comment = comment;

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("categories", "name")
      .populate("ratings.user", "email")
      .populate("comments.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id/comments/:commentId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const commentIndex = movie.comments.findIndex((comment) => comment._id == commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    movie.comments.splice(commentIndex, 1);

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id).populate("categories", "name").populate("ratings.user", "email")
    .populate("comments.user", "email");

    res.status(200).json({ message: "Comment deleted successfully", movie: populatedMovie });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
