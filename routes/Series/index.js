const express = require("express");
const router = express.Router();
const Series = require("../../models/Series");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../VerifyToken");

// Add comment to an episode
router.post(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/comment",
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;
      const { user, comment } = req.body;
      const { userId } = req.user;
      if (user !== userId) {
        return res
          .status(403)
          .json({ message: "You are not allowed to add this comment" });
      }
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      episode.comment.push({ user, comment });
      await series.save();

      res.status(201).json({ message: "Comment added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  }
);

// Update comment for an episode
router.put(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/comment/:commentId",
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, commentId } = req.params;
      const { comment } = req.body;
      const { userId } = req.user;
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      const commentToUpdate = episode.comment.id(commentId);
      if (!commentToUpdate) {
        return res.status(404).json({ message: "Comment not found" });
      } 
      if (commentToUpdate.user.toString() !== userId) {
        return res
        .status(403)
        .json({ message: "You are not allowed to update this comment" });
      }
      commentToUpdate.comment = comment;
      await series.save();

      res.status(200).json({ message: "Comment updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment" });
    }
  }
);
router.delete(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/comment/:commentId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, commentId } = req.params;
      const { userId } = req.user;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.seasons.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episodes.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      const comment = episode.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You are not allowed to delete this comment" });
      }

      comment.remove();
      await series.save();

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  }
);

// Add rating to an episode
router.post(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/rating",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;
      const { user, rating } = req.body;
      const { userId } = req.user;
      console.log(user);
      console.log(userId);
      if (user !== userId) {
        return res
          .status(403)
          .json({ message: "You are not allowed to add this rating" });
      }
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      // Check if the user's _id already exists in the ratings array
      const userAlreadyRated = episode.rating.some((r) => r.user.equals(user));

      if (userAlreadyRated) {
        return res
          .status(400)
          .json({ error: "User already rated this episode" });
      }

      episode.rating.push({ user, rating });
      await series.save();

      res.status(201).json({ message: "Rating added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add rating" });
    }
  }
);

// Update rating for an episode
router.put(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/rating/:ratingId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, ratingId } = req.params;
      const { rating } = req.body;
      const { userId } = req.user;
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }
      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
        );
        if (!season) {
          return res.status(404).json({ message: "Season not found" });
        }
        
        const episode = season.episode.id(episodeId);
        if (!episode) {
          return res.status(404).json({ message: "Episode not found" });
        }
        const ratingToUpdate = episode.rating.id(ratingId);
        if (!ratingToUpdate) {
          return res.status(404).json({ message: "Rating not found" });
        }
        if (ratingToUpdate.user.toString() !== userId) {
          return res
          .status(403)
          .json({ message: "You are not allowed to update this rating" });
        }
      ratingToUpdate.rating = rating;
      await series.save();

      res.status(200).json({ message: "Rating updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update rating" });
    }
  }
);

// Delete rating from an episode
router.delete(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/rating/:ratingId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, ratingId } = req.params;
      const { userId } = req.user;
      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      const ratingIndex = episode.rating.findIndex(
        (rating) => rating._id == ratingId
      );

      if (ratingIndex === -1) {
        return res.status(404).json({ error: "Rating not found" });
      }
      if (episode.rating.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You are not allowed to update this rating" });
      }
      episode.rating.splice(ratingIndex, 1);

      await series.save();

      res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rating" });
    }
  }
);
// Add a series
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { title, story, category } = req.body;

    const series = new Series({
      title,
      story,
      category,
    });

    await series.save();

    res.status(201).json({ message: "Series added successfully", series });
  } catch (error) {
    res.status(500).json({ message: "Failed to add series" });
  }
});
// Update a series
router.put("/:seriesId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { title, story, category } = req.body;

    const series = await Series.findByIdAndUpdate(
      seriesId,
      {
        title,
        story,
        category,
      },
      { new: true }
    );

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    res.status(200).json({ message: "Series updated successfully", series });
  } catch (error) {
    res.status(500).json({ message: "Failed to update series" });
  }
});
// Delete a series
router.delete("/:seriesId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { seriesId } = req.params;

    const series = await Series.findByIdAndDelete(seriesId);

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    res.status(200).json({ message: "Series deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete series" });
  }
});

// Add an episode to a season
router.post(
  "/:seriesId/season/:seasonNumber/episode",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber } = req.params;
      const { title, url } = req.body;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = {
        title,
        url,
        rating: [],
        comment: [],
      };

      season.episode.push(episode);
      await series.save();

      res.status(201).json({ message: "Episode added successfully", episode });
    } catch (error) {
      res.status(500).json({ message: "Failed to add episode" });
    }
  }
);
// Update an episode
router.put(
  "/:seriesId/season/:seasonNumber/episode/:episodeId",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;
      const { title, url } = req.body;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      episode.title = title;
      episode.url = url;

      await series.save();

      res
        .status(200)
        .json({ message: "Episode updated successfully", episode });
    } catch (error) {
      res.status(500).json({ message: "Failed to update episode" });
    }
  }
);
// Delete an episode
router.delete(
  "/:seriesId/season/:seasonNumber/episode/:episodeId",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      // Remove the episode from the season's episodes array
      season.episode.pull(episodeId);
      await series.save();

      res.status(200).json({ message: "Episode deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete episode" });
    }
  }
);

router.post("/:seriesId/season", verifyTokenAndAdmin, async (req, res) => {
  try {
    const seriesId = req.params.seriesId;
    const { title, number, poster } = req.body;

    // Find the series by its ID
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Create a new season
    const season = {
      title,
      number,
      poster,
      episode: [],
    };

    // Add the season to the series
    series.season.push(season);
    await series.save();

    res.status(201).json({ message: "Season added successfully", season });
  } catch (error) {
    res.status(500).json({ message: "Failed to add season" });
  }
});

// Update a season
router.put(
  "/:seriesId/season/:seasonNumber",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber } = req.params;
      const { title, number, poster } = req.body;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      season.title = title;
      season.number = number;
      season.poster = poster;

      await series.save();

      res.status(200).json({ message: "Season updated successfully", season });
    } catch (error) {
      res.status(500).json({ message: "Failed to update season" });
    }
  }
);
// Delete a season
router.delete(
  "/:seriesId/season/:seasonNumber",
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber } = req.params;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      // Remove the season from the series' seasons array
      series.season.pull(season._id);
      await series.save();

      res.status(200).json({ message: "Season deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete season" });
    }
  }
);

// Get a series
router.get("/:seriesId?", async (req, res) => {
  try {
    const { seriesId } = req.params;
    if (seriesId) {
      const series = await Series.findById(seriesId)
        .populate("category", "name")
        .exec();
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      res.status(200).json({ series });
    } else {
      const series = await Series.find({}).populate("category", "name").exec();
      res.status(200).json({ series });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve series" });
  }
});
// Get a season
router.get("/:seriesId/season/:seasonNumber?", async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.params;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }
    if (seasonNumber) {
      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      res.status(200).json({ season });
    } else {
      const seasons = series.season;
      res.status(200).json({ seasons });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve season" });
  }
});
// Get an episode
router.get(
  "/:seriesId/season/:seasonNumber/episode/:episodeId?",
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }
      if (episodeId) {
        const episode = season.episode.id(episodeId);
        if (!episode) {
          return res.status(404).json({ message: "Episode not found" });
        }

        res.status(200).json({ episode });
      } else {
        const episode = season.episode;

        res.status(200).json({ episode });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve episode" });
    }
  }
);
// Get a comment
router.get(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/comment/:commentId?",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, commentId } = req.params;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      if (commentId) {
        const comment = episode.comment.id(commentId);
        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({ comment });
      } else {
        const comment = episode.comment;

        res.status(200).json({ comment });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve comment" });
    }
  }
);
// Get a rating
router.get(
  "/:seriesId/season/:seasonNumber/episode/:episodeId/rating/:ratingId?",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId, ratingId } = req.params;

      const series = await Series.findById(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      const season = series.season.find(
        (season) => season.number === Number(seasonNumber)
      );
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const episode = season.episode.id(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      if (ratingId) {
        const rating = episode.rating.id(ratingId);
        if (!rating) {
          return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json({ rating });
      } else {
        const rating = episode.rating;

        res.status(200).json({ rating });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve rating" });
    }
  }
);
module.exports = router;
