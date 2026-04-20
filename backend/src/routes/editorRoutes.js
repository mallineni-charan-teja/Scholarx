const express = require("express");
const Paper = require("../models/Paper");
const Publication = require("../models/Publication");
const User = require("../models/User");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/assign-reviewer", authMiddleware, roleMiddleware("editor"), async (req, res) => {
  try {
    const { paperId, reviewerId } = req.body;
    const [paper, reviewer] = await Promise.all([
      Paper.findById(paperId),
      User.findById(reviewerId),
    ]);

    if (!paper) return res.status(404).json({ message: "Paper not found." });
    if (!reviewer || reviewer.role !== "reviewer") {
      return res.status(400).json({ message: "Invalid reviewer." });
    }

    if (!paper.assignedReviewers.some((id) => id.toString() === reviewer._id.toString())) {
      paper.assignedReviewers.push(reviewer._id);
    }
    paper.status = "under_review";
    await paper.save();

    return res.json({ message: "Reviewer assigned successfully.", paper });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/update-status", authMiddleware, roleMiddleware("editor"), async (req, res) => {
  try {
    const { paperId, status, journalName } = req.body;
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found." });

    paper.status = status;
    await paper.save();

    let publication = null;
    if (status === "accepted") {
      publication = await Publication.findOneAndUpdate(
        { paperId: paper._id },
        {
          paperId: paper._id,
          journalName: journalName || "ScholarX Journal",
          publicationDate: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return res.json({ message: "Status updated.", paper, publication });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/reviewers", authMiddleware, roleMiddleware("editor"), async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select("name email");
    return res.json(reviewers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/publications", authMiddleware, async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate({ path: "paperId", populate: { path: "authorId", select: "name email" } })
      .sort({ publicationDate: -1 });
    return res.json(publications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
