const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema({
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paper",
    required: true,
    unique: true,
  },
  publicationDate: { type: Date, default: Date.now },
  journalName: { type: String, required: true, trim: true },
});

module.exports = mongoose.model("Publication", publicationSchema);
