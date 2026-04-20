const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  abstract: { type: String, required: true, trim: true },
  keywords: [{ type: String, trim: true }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coAuthors: [{ type: String, trim: true }],
  fileUrl: { type: String, required: true },
  assignedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  submissionDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["submitted", "under_review", "revision", "accepted", "rejected"],
    default: "submitted",
  },
});

module.exports = mongoose.model("Paper", paperSchema);
