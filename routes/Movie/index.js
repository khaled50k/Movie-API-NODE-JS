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
      .populate("category", "name")
      .populate("rating.user", "email")
      .populate("comment.user", "email");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new movie (admin only)
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { title, url, poster, story, category, year } = req.body;

    const newMovie = new Movie({
      title,
      url,
      poster,
      story,
      category,
      year,
    });

    const savedMovie = await newMovie.save();

    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a movie (admin only)
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, poster, story, category, year } = req.body;

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        url,
        poster,
        story,
        category,
        year,
      },
      { new: true }
    ).populate("category", "name");

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a movie (admin only)
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

// Add a rating to a movie
router.post("/:id/rating", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, rating } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const userAlreadyRated = movie.rating.some((r) => r.user.equals(user));

    if (userAlreadyRated) {
      return res.status(400).json({ error: "User already rated this movie" });
    }

    movie.rating.push({ user, rating });

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("category", "name")
      .populate("rating.user", "email")
      .populate("comment.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a rating of a movie
router.put(
  "/:id/rating/:ratingId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, ratingId } = req.params;
      const { rating } = req.body;

      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      const ratingIndex = movie.rating.findIndex(
        (rating) => rating._id == ratingId
      );

      if (ratingIndex === -1) {
        return res.status(404).json({ error: "Rating not found" });
      }

      movie.rating[ratingIndex].rating = rating;

      const updatedMovie = await movie.save();

      const populatedMovie = await Movie.findById(updatedMovie._id)
        .populate("category", "name")
        .populate("rating.user", "email")
        .populate("comment.user", "email");

      res.status(200).json(populatedMovie);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete a rating from a movie
router.delete(
  "/:id/rating/:ratingId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, ratingId } = req.params;

      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      const ratingIndex = movie.rating.findIndex(
        (rating) => rating._id == ratingId
      );

      if (ratingIndex === -1) {
        return res.status(404).json({ error: "Rating not found" });
      }

      movie.rating.splice(ratingIndex, 1);

      const updatedMovie = await movie.save();

      const populatedMovie = await Movie.findById(updatedMovie._id)
        .populate("category", "name")
        .populate("rating.user", "email")
        .populate("comment.user", "email");

      res.status(200).json({
        message: "Rating deleted successfully",
        movie: populatedMovie,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Add a comment to a movie
router.post("/:id/comment", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, comment } = req.body;
    const { userId } = req.user;
    if (user !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to add this comment" });
    }
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    movie.comment.push({ user, comment });

    const updatedMovie = await movie.save();

    const populatedMovie = await Movie.findById(updatedMovie._id)
      .populate("category", "name")
      .populate("rating.user", "email")
      .populate("comment.user", "email");

    res.status(200).json(populatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a comment of a movie
router.put(
  "/:id/comment/:commentId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, commentId } = req.params;
      const { comment } = req.body;

      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      const commentIndex = movie.comment.findIndex(
        (comment) => comment._id == commentId
      );

      if (commentIndex === -1) {
        return res.status(404).json({ error: "Comment not found" });
      }

      movie.comment[commentIndex].comment = comment;

      const updatedMovie = await movie.save();

      const populatedMovie = await Movie.findById(updatedMovie._id)
        .populate("category", "name")
        .populate("rating.user", "email")
        .populate("comment.user", "email");

      res.status(200).json(populatedMovie);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
// Get a comment by its ID
router.get(
  "/:id/comment/:commentId?",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, commentId } = req.params;

      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      if (!movie) {
        return res.status(404).json({ error: "Comment not found" });
      }
      if (commentId) {
        const comment = movie.comment.find(
          (c) => c._id.toString() === commentId
        );

        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }

        res.status(200).json({ comment });
      } else {
        const comment = movie.comment;

        res.status(200).json({ comment });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
// Get a rating by its ID
router.get(
  "/:id/rating/:ratingId?",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, ratingId } = req.params;

      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      if (ratingId) {
        const rating = movie.rating.id(ratingId);
        if (!rating) {
          return res.status(404).json({ error: "Rating not found" });
        }

        res.status(200).json(rating);
      } else {
        const rating = movie.rating;
        res.status(200).json(rating);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete a comment from a movie
router.delete(
  "/:id/comment/:commentId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { id, commentId } = req.params;

      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      const commentIndex = movie.comment.findIndex(
        (comment) => comment._id == commentId
      );

      if (commentIndex === -1) {
        return res.status(404).json({ error: "Comment not found" });
      }

      movie.comment.splice(commentIndex, 1);

      const updatedMovie = await movie.save();

      const populatedMovie = await Movie.findById(updatedMovie._id)
        .populate("category", "name")
        .populate("rating.user", "email")
        .populate("comment.user", "email");

      res.status(200).json({
        message: "Comment deleted successfully",
        movie: populatedMovie,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
