const express = require("express");
const router = express.Router();
const { upload_video,upload_photo } = require("../../controller");
 
router.post("/video/", upload_video);
router.post("/photo/", upload_photo);
 
module.exports = router;