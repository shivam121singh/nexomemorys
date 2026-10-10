const Memory = require('../models/Memory');

// GET /api/memories
exports.getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: -1 });
    res.status(200).json(memories);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve memories from vault' });
  }
};

// POST /api/upload
exports.createMemory = async (req, res) => {
  try {
    const { caption, pin } = req.body;

    if (pin !== process.env.UPLOAD_SECRET_PIN) {
      return res.status(403).json({ error: 'Wrong Squad PIN! Vault access denied.' });
    }

    // Support both multi-file (req.files) and single-file fallback (req.file)
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No media files provided.' });
    }

    const savedMemories = [];

    for (const file of files) {
      const isVideo = file.mimetype.startsWith('video');

      const newMemory = new Memory({
        url: file.path,
        mediaType: isVideo ? 'video' : 'image',
        uploader: 'Room 301 Squad',
        caption: caption || 'Unlabeled lore.',
        category: 'Memories'
      });

      const saved = await newMemory.save();
      savedMemories.push(saved);
    }

    res.status(201).json({
      success: true,
      count: savedMemories.length,
      data: savedMemories
    });
  } catch (err) {
    console.error('Upload controller error:', err);
    res.status(500).json({ error: err.message || 'Server error while storing memory' });
  }
};

// POST /api/memories/:id/like
exports.likeMemory = async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    res.status(200).json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Could not record like' });
  }
};