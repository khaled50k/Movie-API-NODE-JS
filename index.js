const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const UploadRoute = require("./routes/upload/UploadRoute");
const fileupload = require("express-fileupload");
const Series = require("./models/Series");
const Movie = require("./routes/Movie/index");
const Category = require("./routes/Category/index");
const Authentication = require("./routes/Authentication/index");

dotenv.config();

const port = 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(fileupload({ useTempFiles: true }));
app.use(
  cors({
    origin: "*",
  })
);
const connectDB = require("./db"); // Import the connectDB function from db.js
connectDB(); // Call the connectDB function to establish the database connection

app.get("/", async(req, res) => {
  // Create a new series
  const newSeries = new Series({
    title: 'Stranger Things',
    story: 'A group of young friends in a small town uncover dark secrets when a mysterious girl with telekinetic powers appears.',
    categories: ['Science Fiction', 'Horror'],
    seasons: [
      {
        title: 'Season 1',
        number: 1,
        poster: 'https://example.com/season1-poster.jpg',
        episodes: [
          {
            title: 'Chapter One: The Vanishing of Will Byers',
            url: 'https://example.com/episode1'
          },
          {
            title: 'Chapter Two: The Weirdo on Maple Street',
            url: 'https://example.com/episode2'
          }
        ]
      },
      {
        title: 'Season 2',
        number: 2,
        poster: 'https://example.com/season2-poster.jpg',
        episodes: [
          {
            title: 'Chapter One: Madmax',
            url: 'https://example.com/episode3'
          },
          {
            title: 'Chapter Two: Trick or Treat, Freak',
            url: 'https://example.com/episode4'
          }
        ]
      }
    ]
  });
  
  // // Save the series to the database
  // newSeries.save().then(() => {
  //   console.log('Series saved successfully!');
  // }).catch((error) => {
  //   console.error('Failed to save series:', error);
  // });
  const newMovie = new Movie({
    title: 'Inception',
    url: 'https://example.com/inception',
    poster: 'https://example.com/inception-poster.jpg',
    story: 'A thief with the ability to enter people\'s dreams is hired to plant an idea into a CEO\'s mind.',
    category: ['Action', 'Thriller', 'Science Fiction'],
    year: 2010,
  });
  
  // Save the movie to the database
  // newMovie.save().then(() => {
  //   console.log('Movie saved successfully!');
  // }).catch((error) => {
  //   console.error('Failed to save movie:', error);
  // });
 const s=await Series.find({})
  res.status(200).json(s);
});

// Route for uploading a movie to Cloudinary
app.use("/upload", UploadRoute);
app.use("/movie", Movie);
app.use("/category", Category);
app.use("/auth", Authentication);
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
