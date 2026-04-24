const express = require('express');
const router = express.Router();
const cruiseLines = require('../data/cruiseLines.json');

// GET /api/cruise-lines
router.get('/', (req, res) => {
  res.json(cruiseLines);
});

// GET /api/cruise-lines/:id
router.get('/:id', (req, res) => {
  const line = cruiseLines.find(cl => cl.id === req.params.id);
  if (!line) return res.status(404).json({ error: 'Cruise line not found' });
  res.json(line);
});

module.exports = router;
