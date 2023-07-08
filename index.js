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
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
var csurf = require("csurf");
const hpp = require("hpp");
dotenv.config();

const port = 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum number of requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Maximum number of requests per windowMs (for each ip)
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  headers: true, // Enable headers configuration
});
const app = express();
var csrfProtection = csurf({ cookie: true });
app.use(bodyParser.urlencoded());
// Express middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp());
app.use(express.json({ limit: "20kb" })); //set request size limits(request body)
app.use(cookieParser());
app.use(fileupload({ useTempFiles: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(limiter);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "trusted-scripts.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["data:", "cdn.example.com"],
    },
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
app.use(
  "/auth",
  authLimiter,
  (req, res, next) => {
    // Set the Retry-After header in the response
    res.setHeader("Retry-After", Math.ceil(authLimiter.windowMs / 1000));
    next();
  },
  Authentication
);
// *additionall secuirty to prevent hackers send requests in behalf authraized user
// app.get('/form', csrfProtection,function (req, res) {
//   // pass the csrfToken to the view
//   res.setHeader('csrf-token', req.csrfToken());
//   res.send({ csrfToken: req.csrfToken() })
// })
// app.post('/process', csrfProtection,function (req, res) {
//   res.json('csrf was required to get here')
// })
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
