const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: "Paper", required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: { type: String, required: true, trim: true },
  decision: {
    type: String,
    enum: ["approve", "reject", "revise"],
    required: true,
  },
  reviewDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
