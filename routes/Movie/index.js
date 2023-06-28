const express = require("express");
const router = express.Router();
const Movie=require('../../models/Movie')
const {
    getUserId,
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../VerifyToken/index");
router.get('/',async (req,res)=>{
const response =await Movie.find({})
res.status(200).json(response)
})

module.exports = router;