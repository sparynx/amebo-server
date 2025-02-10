// likes.router.js
const express = require("express");
const { addLike, removeLike, getLikes } = require("./likes.controller");

const router = express.Router();

router.post("/:postId/like", addLike);
router.delete("/:postId/unlike", removeLike);
router.get("/:postId/likes", getLikes);  // Note the plural 'likes' here

module.exports = router;
