const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const shipsDir = path.join(__dirname, '../data/ships');
const legacyFile = path.join(__dirname, '../data/ships.json');

// Auto-migrate: on first run, split legacy ships.json into per-cruise-line files
if (!fs.existsSync(shipsDir) && fs.existsSync(legacyFile)) {
  fs.mkdirSync(shipsDir, { recursive: true });
  const allShips = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  const byLine = {};
  for (const ship of allShips) {
    if (!byLine[ship.cruiseLineId]) byLine[ship.cruiseLineId] = [];
    byLine[ship.cruiseLineId].push(ship);
  }
  for (const [lineId, lineShips] of Object.entries(byLine)) {
    fs.writeFileSync(path.join(shipsDir, `${lineId}.json`), JSON.stringify(lineShips, null, 2));
  }
  console.log(`Ships split into ${Object.keys(byLine).length} cruise-line files in ${shipsDir}`);
}

// Load ships from all per-cruise-line JSON files
const ships = fs.readdirSync(shipsDir)
  .filter(f => f.endsWith('.json'))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(shipsDir, f), 'utf8')));

// GET /api/ships  (optionally filter by ?cruiseLineId=xxx)
router.get('/', (req, res) => {
  const { cruiseLineId } = req.query;
  if (cruiseLineId) {
    return res.json(ships.filter(s => s.cruiseLineId === cruiseLineId));
  }
  res.json(ships);
});

// GET /api/ships/:id
router.get('/:id', (req, res) => {
  const ship = ships.find(s => s.id === req.params.id);
  if (!ship) return res.status(404).json({ error: 'Ship not found' });
  res.json(ship);
});

module.exports = router;
