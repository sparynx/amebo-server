const Post = require("./post.model");

const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, authorId, authorName, categories } = req.body; // Added authorName
    const newPost = new Post({ 
      title, 
      content, 
      imageUrl, 
      authorId,
      categories, 
      authorName // Include authorName in new post
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("likes")
      .populate("comments")
      .sort({ createdAt: -1 }); // Added sorting by creation date
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("likes").populate("comments");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
}