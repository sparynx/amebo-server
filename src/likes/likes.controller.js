// likes.controller.js
const Like = require("./likes.model");
const Post = require("../posts/post.model");

const addLike = async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId } = req.params;

        if (!userId || !postId) {
            return res.status(400).json({ error: "User ID and Post ID are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const existingLike = await Like.findOne({ userId, postId });
        if (existingLike) {
            return res.status(400).json({ error: "User already liked this post" });
        }

        const like = new Like({ userId, postId });
        await like.save();

        await Post.findByIdAndUpdate(postId, { $push: { likes: like._id } });

        res.status(201).json({ message: "Post liked", like });
    } catch (error) {
        console.error("Like Post Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const removeLike = async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId } = req.params;

        if (!userId || !postId) {
            return res.status(400).json({ error: "User ID and Post ID are required" });
        }

        const existingLike = await Like.findOne({ userId, postId });
        if (!existingLike) {
            return res.status(404).json({ error: "Like not found" });
        }

        await Like.findByIdAndDelete(existingLike._id);
        await Post.findByIdAndUpdate(postId, { $pull: { likes: existingLike._id } });

        res.status(200).json({ message: "Post unliked" });
    } catch (error) {
        console.error("Remove Like Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add this new controller function
const getLikes = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const likes = await Like.find({ postId }).populate('userId', 'displayName');
        
        res.status(200).json(likes);
    } catch (error) {
        console.error("Get Likes Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    addLike,
    removeLike,
    getLikes
};