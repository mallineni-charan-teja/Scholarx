const express = require("express");
const Paper = require("../models/Paper");
const Review = require("../models/Review");
const upload = require("../middleware/uploadMiddleware");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("researcher"),
  upload.single("paper"),
  async (req, res) => {
    try {
      const { title, abstract, keywords, coAuthors } = req.body;
      if (!req.file) return res.status(400).json({ message: "Paper file is required." });

      const paper = await Paper.create({
        title,
        abstract,
        keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
        coAuthors: coAuthors ? coAuthors.split(",").map((c) => c.trim()) : [],
        authorId: req.user._id,
        fileUrl: `/uploads/${req.file.filename}`,
      });

      return res.status(201).json(paper);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/", authMiddleware, async (req, res) => {
  try {
    let papers;
    if (req.user.role === "researcher") {
      papers = await Paper.find({ authorId: req.user._id }).sort({ submissionDate: -1 });
    } else if (req.user.role === "reviewer") {
      papers = await Paper.find({ assignedReviewers: req.user._id }).sort({ submissionDate: -1 });
    } else {
      papers = await Paper.find().populate("authorId", "name email").sort({ submissionDate: -1 });
    }
    return res.json(papers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id).populate("authorId", "name email");
    if (!paper) return res.status(404).json({ message: "Paper not found." });

    if (
      req.user.role === "researcher" &&
      paper.authorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (
      req.user.role === "reviewer" &&
      !paper.assignedReviewers.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const reviews = await Review.find({ paperId: paper._id }).populate("reviewerId", "name email");
    return res.json({ paper, reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("researcher"),
  upload.single("paper"),
  async (req, res) => {
    try {
      const paper = await Paper.findById(req.params.id);
      if (!paper) return res.status(404).json({ message: "Paper not found." });
      if (paper.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }

      const { title, abstract, keywords, coAuthors } = req.body;
      if (title) paper.title = title;
      if (abstract) paper.abstract = abstract;
      if (keywords) paper.keywords = keywords.split(",").map((k) => k.trim());
      if (coAuthors) paper.coAuthors = coAuthors.split(",").map((c) => c.trim());
      if (req.file) paper.fileUrl = `/uploads/${req.file.filename}`;
      paper.status = "revision";

      await paper.save();
      return res.json(paper);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
