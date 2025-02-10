const express = require("express");
const { addComment, getCommentsByPost } = require("./comment.controller");

const router = express.Router();

router.post("/:postId/comments", addComment); // Add :postId here
router.get("/:postId/comments", getCommentsByPost); // Add :postId here

module.exports = router;
