const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getChildren,
  addChild,
  editChild,
  removeChild,
} = require("../controllers/childController");

router.get("/", protect, getChildren);
router.post("/", protect, addChild);
router.put("/:id", protect, editChild);
router.delete("/:id", protect, removeChild);

module.exports = router;
