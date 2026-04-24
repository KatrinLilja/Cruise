const express = require('express');
const cors = require('cors');
const path = require('path');
const cruiseLinesRouter = require('./routes/cruiseLines');
const shipsRouter = require('./routes/ships');
const imageProxyRouter = require('./routes/imageProxy');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/cruise-lines', cruiseLinesRouter);
app.use('/api/ships', shipsRouter);
app.use('/api/image-proxy', imageProxyRouter);

// Serve the built React app in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Catch-all: let React Router handle client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
