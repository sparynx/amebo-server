const express = require("express");
const { createPost, getAllPosts, getPostById, deletePost } = require("./post.controller");
const verifyAdminToken = require("../middleware/VerifyAdminToken");

const router = express.Router();

router.post("/create", createPost);
router.get("/", getAllPosts);
router.get("/:postId", getPostById);

router.delete("/:id", verifyAdminToken, deletePost);

module.exports = router;
