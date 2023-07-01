const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const UploadRoute = require("./routes/upload/UploadRoute");
const fileupload = require("express-fileupload");
const Movie = require("./routes/Movie/index");
const Series = require("./routes/Series/index");
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
// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
const connectDB = require("./db"); // Import the connectDB function from db.js
connectDB(); // Call the connectDB function to establish the database connection


app.use("/upload", UploadRoute);
app.use("/movie", Movie);
app.use("/series", Series);
app.use("/category", Category);
app.use("/auth", Authentication);
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
