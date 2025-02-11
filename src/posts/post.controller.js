const Post = require("./post.model");

const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, authorId, authorName, categories } = req.body;
    const newPost = new Post({ 
      title, 
      content, 
      imageUrl, 
      authorId,
      categories, 
      authorName
    });
    await newPost.save();
    
    // Get io instance and emit new post event
    const io = req.app.get('io');
    io.emit('newPost', {
      post: newPost,
      notification: {
        title: "New Post Created!",
        message: `${authorName} just shared: ${title}`,
        type: "success"
      }
    });
    
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