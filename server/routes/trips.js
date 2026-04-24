'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const https = require('https');

const tripsDir = path.join(__dirname, '../data/trips');

// Ship slug → image URL (from verified celebrity.json ship data)
const CELEBRITY_SHIP_IMAGES = {
  beyond:        'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/beyond-renderings/celebrity-beyond-updated-rendition-2560x1440.jpg',
  ascent:        'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/celebrity-ascent-in-the-caribbean-2560x1440.jpg',
  edge:          'https://www.celebritycruises.com/content/dam/celebrity/new-images/Celebrity-Edge.jpg',
  apex:          'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/evening-celebrity-apex-ship-exterior-2560x1440.jpg',
  millennium:    'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/millennium-aerial-view-2560x1440.jpg',
  equinox:       'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/equinox-aerial-view-60-opacity-2560x1440.jpg',
  reflection:    'https://www.celebritycruises.com/content/dam/celebrity/ship-overview/9935-ship-exterior-reflection-overview-80-opacity.jpg',
  eclipse:       'https://www.celebritycruises.com/content/dam/celebrity/new-images/ship-things-to-do-onboard/ships/CEL-Eclipse-Aerial-2560x1440.jpg',
  silhouette:    'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/silhouette-2560x1440.jpg',
  solstice:      'https://www.celebritycruises.com/content/dam/celebrity/new-images/celebrity-solstice-pictures/CEL_SI_ExteriorSun_Solstice_BlueHull-2560x1440.jpg',
  constellation: 'https://www.celebritycruises.com/content/dam/celebrity/new-images/celebrity-constellation-pictures/CEL-CS-Oslo-060-2360X1440.jpg',
  infinity:      'https://www.celebritycruises.com/content/dam/celebrity/new-images/ship-things-to-do-onboard/ships/infinity-ship-2-2560x1440.jpg',
  summit:        'https://www.celebritycruises.com/content/dam/celebrity/new-images/ships/summit-aerial-view-60-opacity-2560x1440.jpg',
  flora:         'https://www.celebritycruises.com/content/dam/celebrity/new-images/celebrity-flora-story/Welcoming-Flora_SCIENCE-PARTNERSHIPS-2560x1440.jpg',
  xcel:          'https://www.celebritycruises.com/xcel/opengraph-image.jpg',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Scrape real price and departure date from Celebrity's itinerary page (schema.org microdata)
async function fetchVoyageDetails(trip) {
  if (!trip.url) return {};
  const attempt = async () => {
    const html = await fetchUrl(trip.url);
    const priceMatch = html.match(/itemprop="lowPrice"\s+content="([^"]+)"/i);
    const dateMatch  = html.match(/itemprop="validFrom"\s+content="([^"]+)"/i);
    return {
      price:         priceMatch ? parseFloat(priceMatch[1]) : null,
      departureDate: dateMatch  ? dateMatch[1].split('T')[0] : null,
    };
  };
  try {
    const result = await attempt();
    if (result.price != null || result.departureDate != null) return result;
    // Got a response but no data — retry once after delay
    await new Promise(r => setTimeout(r, 1500));
    return await attempt();
  } catch (_) {
    try {
      await new Promise(r => setTimeout(r, 1500));
      return await attempt();
    } catch (__) {
      return {};
    }
  }
}

function toTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseItinerarySlug(slug) {
  // Pattern: {N}-night-{description}-from-{port}-on-{ship}-{VOYAGECODE}
  const match = slug.match(/^(\d+)-night-(.+)-from-(.+)-on-(.+)-([A-Z][A-Z0-9]+)$/);
  if (!match) return null;
  const [, nights, destSlug, portSlug, shipSlug, voyageCode] = match;
  return {
    id: voyageCode,
    cruiseLineId: 'celebrity',
    name: `${nights} Night ${toTitle(destSlug)}`,
    nights: parseInt(nights, 10),
    destination: toTitle(destSlug),
    departurePort: toTitle(portSlug),
    ship: `Celebrity ${toTitle(shipSlug)}`,
    shipId: `celebrity-${shipSlug}`,
    voyageCode,
    url: `https://www.celebritycruises.com/itinerary/${slug}`,
    image: CELEBRITY_SHIP_IMAGES[shipSlug] || null,
  };
}

async function bootstrapCelebrity() {
  console.log('[trips] Fetching Celebrity itinerary sitemap...');
  const xml = await fetchUrl('https://www.celebritycruises.com/sitemap/itinerary-details.xml');

  // Extract only the canonical (non-locale) itinerary URLs
  const slugs = [...xml.matchAll(
    /<loc>https:\/\/www\.celebritycruises\.com\/itinerary\/([^<]+)<\/loc>/g
  )].map(m => m[1]);

  const trips = slugs.map(parseItinerarySlug).filter(Boolean);

  fs.mkdirSync(tripsDir, { recursive: true });
  const outPath = path.join(tripsDir, 'celebrity.json');
  fs.writeFileSync(outPath, JSON.stringify(trips, null, 2));
  console.log(`[trips] Saved ${trips.length} Celebrity trips to ${outPath}`);
  return trips;
}

// In-memory cache: { cruiseLineId: trip[] }
const tripsCache = {};

// Bootstrap on startup — load from file or fetch from web
const ready = (async () => {
  fs.mkdirSync(tripsDir, { recursive: true });
  const file = path.join(tripsDir, 'celebrity.json');
  if (fs.existsSync(file)) {
    tripsCache.celebrity = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`[trips] Loaded ${tripsCache.celebrity.length} Celebrity trips from cache`);
  } else {
    tripsCache.celebrity = await bootstrapCelebrity();
  }
})().catch(err => console.error('[trips] Bootstrap error:', err));

// GET /api/trips  — all trips
router.get('/', async (req, res) => {
  await ready;
  res.json(Object.values(tripsCache).flat());
});

// GET /api/trips/:cruiseLineId  — trips for one cruise line
router.get('/:cruiseLineId', async (req, res) => {
  await ready;
  const trips = tripsCache[req.params.cruiseLineId];
  if (!trips) return res.status(404).json({ error: 'No trips found for this cruise line' });
  res.json(trips);
});

// Estimate a starting price based on trip duration and destination.
// Uses publicly known Celebrity Cruises price ranges (inside cabin, per person).
function estimatePrice(nights, destination) {
  const d = (destination || '').toLowerCase();
  const n = parseInt(nights, 10) || 7;

  const isCaribbean = /caribbean|bahamas|carib|key west|cozumel|jamaica|grand cayman|puerto rico|st\. |saint/.test(d);
  const isMexico    = /mexico|cabo|baja|mazatlan|ensenada/.test(d);
  const isEurope    = /mediterr|europe|italy|spain|france|greek|greece|norway|iceland|scandin|british|ireland|portugal|iberian|adriatic|fjord|baltic|canary|azores|croatia|turkey|malta|sicily/.test(d);
  const isAlaska    = /alaska/.test(d);
  const isBermuda   = /bermuda/.test(d);
  const isPanama    = /panama/.test(d);
  const isCanada    = /canada|england|transatlantic|new england/.test(d);

  let base;
  if (isCaribbean || isMexico) {
    base = n <= 4 ? 299 : n <= 7 ? 649 : n <= 10 ? 999 : 1299;
  } else if (isEurope) {
    base = n <= 7 ? 1099 : n <= 10 ? 1599 : n <= 14 ? 2199 : 2999;
  } else if (isAlaska) {
    base = n <= 7 ? 1099 : n <= 10 ? 1599 : 2199;
  } else if (isBermuda) {
    base = n <= 7 ? 799 : 1199;
  } else if (isPanama) {
    base = n <= 10 ? 1399 : n <= 14 ? 1999 : 2799;
  } else if (isCanada) {
    base = n <= 7 ? 899 : n <= 10 ? 1299 : 1799;
  } else {
    // Generic fallback scaled by duration
    base = n <= 4 ? 399 : n <= 7 ? 749 : n <= 10 ? 1199 : 1699;
  }
  return base;
}

// GET /api/trips/:cruiseLineId/:id/price  — fetch price and departure date for a trip
router.get('/:cruiseLineId/:id/price', async (req, res) => {
  await ready;
  const { cruiseLineId, id: voyageCode } = req.params;
  const trips = tripsCache[cruiseLineId] || [];
  const trip = trips.find(t => t.id === voyageCode);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Return cached real data if fully available
  if (trip.price != null && trip.departureDate != null) {
    return res.json({ price: trip.price, departureDate: trip.departureDate, currency: 'USD', estimated: false });
  }

  // Scrape Celebrity's itinerary page for real price + departure date
  const details = await fetchVoyageDetails(trip);
  if (details.price != null || details.departureDate != null) {
    if (details.price != null) trip.price = details.price;
    if (details.departureDate != null) trip.departureDate = details.departureDate;
    const file = path.join(tripsDir, `${cruiseLineId}.json`);
    fs.writeFileSync(file, JSON.stringify(trips, null, 2));
    return res.json({ price: trip.price, departureDate: trip.departureDate, currency: 'USD', estimated: false });
  }

  // Fall back to estimated price, no date
  const estimated = estimatePrice(trip.nights, trip.destination);
  res.json({ price: estimated, departureDate: null, currency: 'USD', estimated: true });
});

// GET /api/trips/:cruiseLineId/:id  — single trip by voyage code
router.get('/:cruiseLineId/:id', async (req, res) => {
  await ready;
  const trips = tripsCache[req.params.cruiseLineId] || [];
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

module.exports = router;
