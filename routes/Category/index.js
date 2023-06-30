const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const {
    getUserId,
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../VerifyToken/index");

// Get all categories
router.get("/", async (req, res) => {
    const title = req.query.title ? req.query.title : "";
    const regex = new RegExp(title, "i"); // case-insensitive search
  
  try {
    const categories = await Category.find({name:regex});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new category
router.post("/",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a category
router.put("/:id",verifyTokenAndAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
  
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Delete a category
  router.delete("/:id",verifyTokenAndAdmin, async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedCategory = await Category.findByIdAndDelete(id);
  
      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  module.exports = router;