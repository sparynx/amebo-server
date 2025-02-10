const Comment = require("./comment.model");
const Post = require("../posts/post.model");
const mongoose = require('mongoose');

const addComment = async (req, res) => {
  try {
    console.log('Received comment request:', {
      params: req.params,
      body: req.body
    });

    const { postId } = req.params;
    const { content, userId, authorName, userDisplayName } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!content) missingFields.push('content');
    if (!userId) missingFields.push('userId');
    if (!authorName) missingFields.push('authorName');
    if (!userDisplayName) missingFields.push('userDisplayName');
    if (!postId) missingFields.push('postId');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log('Invalid postId format:', postId);
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    // Find post first to ensure it exists
    const post = await Post.findById(postId);
    if (!post) {
      console.log('Post not found:', postId);
      return res.status(404).json({ error: "Post not found" });
    }

    // Create and save the comment
    const savedComment = await Comment.create({
      postId,
      userId,
      content,
      authorName,
      userDisplayName
    });

    console.log('Saved comment:', savedComment);

    // Update post with new comment using findByIdAndUpdate to avoid validation
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            _id: savedComment._id,
            content: content,
            userId: userId,
            authorName: authorName,
            userDisplayName: userDisplayName,
            createdAt: savedComment.createdAt
          }
        }
      },
      { new: true, runValidators: false }
    );

    console.log('Updated post with new comment');
    
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Detailed error in addComment:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      type: error.name
    });
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    addComment,
    getCommentsByPost
};