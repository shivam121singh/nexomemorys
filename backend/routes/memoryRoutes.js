const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  getAllMemories,
  createMemory,
  likeMemory
} = require('../controllers/memoryController');

router.get('/memories', getAllMemories);
router.post('/upload', upload.array('mediaFiles', 10), createMemory);
router.post('/memories/:id/like', likeMemory);

module.exports = router;