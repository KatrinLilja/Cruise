const express = require('express');
const https = require('https');
const http = require('http');
const router = express.Router();

// GET /api/image-proxy?url=<encoded-image-url>
// Proxies the image server-side so hotlink protection is bypassed
router.get('/', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  // Only allow proxying from trusted domains
  const allowedHosts = ['assets.dm.rccl.com', 'images.ctfassets.net', 'www.celebritycruises.com', 'images.celebritycruises.com', 'www.carnival.com', 'www.ncl.com', 'www.msccruises.com'];
  if (!allowedHosts.includes(targetUrl.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  const client = targetUrl.protocol === 'https:' ? https : http;

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Referer': `https://${targetUrl.hostname}/`,
    },
  };

  const proxyReq = client.request(options, (proxyRes) => {
    // Follow redirect
    if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode)) {
      const location = proxyRes.headers['location'];
      if (location) return res.redirect(`/api/image-proxy?url=${encodeURIComponent(location)}`);
    }

    res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => res.status(502).json({ error: 'Failed to fetch image' }));
  proxyReq.end();
});

module.exports = router;
