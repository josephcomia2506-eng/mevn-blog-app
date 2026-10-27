const Post = require('../models/Post');

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to retrieve posts.'
        });
    }
};

const getSinglePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username');

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        return res.status(200).json(post);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        return res.status(500).json({
            message: 'Unable to retrieve post.'
        });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                message: 'Title and content are required.'
            });
        }

        const post = await Post.create({
            title: title.trim(),
            content: content.trim(),
            author: req.user._id
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username');

        return res.status(201).json({
            message: 'Post created successfully.',
            post: populatedPost
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to create post.'
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                message: 'Title and content are required.'
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        if (
            post.author.toString() !== req.user._id.toString() &&
            !req.user.isAdmin
        ) {
            return res.status(403).json({
                message: 'You can only update your own posts.'
            });
        }

        post.title = title.trim();
        post.content = content.trim();

        await post.save();
        await post.populate('author', 'username');

        return res.status(200).json({
            message: 'Post updated successfully.',
            post
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        return res.status(500).json({
            message: 'Unable to update post.'
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        const isOwner =
            post.author.toString() === req.user._id.toString();

        if (!isOwner && !req.user.isAdmin) {
            return res.status(403).json({
                message: 'You cannot delete another user’s post.'
            });
        }

        await post.deleteOne();

        return res.status(200).json({
            message: 'Post deleted successfully.'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        return res.status(500).json({
            message: 'Unable to delete post.'
        });
    }
};

module.exports = {
    getAllPosts,
    getSinglePost,
    createPost,
    updatePost,
    deletePost
};