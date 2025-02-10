// Post Schema (post.model.js)
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    authorId: { type: String, required: true },
    categories: { type: String, required: true },
    authorName: { type: String, required: true }, // Added authorName field
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, text: String, userId: String, ref: "Comment" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);