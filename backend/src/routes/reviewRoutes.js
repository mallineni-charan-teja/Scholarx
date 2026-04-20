const express = require("express");
const Paper = require("../models/Paper");
const Review = require("../models/Review");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("reviewer"), async (req, res) => {
  try {
    const { paperId, comments, decision } = req.body;
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found." });

    const assigned = paper.assignedReviewers.some((id) => id.toString() === req.user._id.toString());
    if (!assigned) return res.status(403).json({ message: "You are not assigned to this paper." });

    const existing = await Review.findOne({ paperId, reviewerId: req.user._id });
    if (existing) return res.status(400).json({ message: "Review already submitted." });

    const review = await Review.create({
      paperId,
      reviewerId: req.user._id,
      comments,
      decision,
    });

    paper.status = "under_review";
    await paper.save();
    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:paperId", authMiddleware, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found." });

    if (req.user.role === "researcher" && paper.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }
    if (
      req.user.role === "reviewer" &&
      !paper.assignedReviewers.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const reviews = await Review.find({ paperId: req.params.paperId }).populate(
      "reviewerId",
      "name email"
    );
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
