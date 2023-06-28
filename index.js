const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const UploadRoute = require("./routes/upload/UploadRoute");
const fileupload = require("express-fileupload");

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

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Route for uploading a movie to Cloudinary
app.use("/upload", UploadRoute);
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
