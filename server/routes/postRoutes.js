const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { verify } = require('../middleware/auth');

router.get('/', postController.getAllPosts);
router.get('/:postId', postController.getSinglePost);

router.post('/', verify, postController.createPost);
router.put('/:postId', verify, postController.updatePost);
router.delete('/:postId', verify, postController.deletePost);

module.exports = router;