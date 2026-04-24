'use strict';
const fs = require('fs');
const path = require('path');

const scraperDir = path.join(__dirname, 'scraper');
const scrapedDir = path.join(scraperDir, 'scraped');
fs.mkdirSync(scraperDir, { recursive: true });
fs.mkdirSync(scrapedDir, { recursive: true });
console.log('Created scraper/ and scraper/scraped/');

// ── package.json ─────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(scraperDir, 'package.json'), JSON.stringify({
  name: 'cruise-scraper',
  version: '1.0.0',
  description: 'Scraper for cruise ship data from official websites',
  main: 'scrape.js',
  dependencies: {
    axios: '^1.6.0',
    cheerio: '^1.0.0'
  }
}, null, 2));
console.log('Created package.json');

// ── Shared amenity templates ──────────────────────────────────────────────────
const amenities = {
  iconClass: {
    dining: ['Main Dining Room', 'Windjammer Marketplace buffet', 'Park Café', 'El Loco Fresh', 'Sorrento\'s Pizza', 'Coastal Kitchen (suite guests)', 'Multiple specialty restaurants (Chops Grille, Giovanni\'s, Izumi, Hooked Seafood, etc.)'],
    entertainment: ['AquaTheater water shows', 'FlowRider surf simulator', 'Zip line', 'Rock climbing wall', 'Mini golf', 'Casino Royale', 'Broadway-style shows', 'Comedy club', 'Live music venues', 'Water slides', 'Crown\'s Edge sky walk'],
    recreation: ['Multiple pools including family and adults-only Solarium', 'Hot tubs', 'Full-service spa & salon', 'Fitness center', 'Sports court', 'Jogging track'],
    included: ['All meals in Main Dining Room and Windjammer buffet', 'Live entertainment and Broadway shows', 'Kids & teens clubs (Adventure Ocean)', 'Access to pools, fitness center, and sports areas', 'FlowRider surf simulator and rock climbing wall']
  },
  quantumClass: {
    dining: ['Main Dining Room', 'Windjammer Marketplace', 'Café Two70', 'El Loco Fresh', 'Sorrento\'s Pizza', 'Park Café', 'Specialty restaurants (Wonderland, Chops Grille, Giovanni\'s, Izumi, etc.)'],
    entertainment: ['Two70 flexible venue with robotic screens', 'SeaPlex indoor sports complex', 'RipCord by iFly indoor skydiving simulator', 'FlowRider surf simulator', 'NorthStar observation capsule', 'Rock climbing wall', 'Casino Royale', 'Broadway-style shows', 'Comedy club'],
    recreation: ['Indoor/outdoor pool area', 'Solarium adults-only pool', 'Hot tubs', 'Full spa & salon', 'Fitness center', 'Sports court', 'Jogging track', 'Bumper cars at SeaPlex'],
    included: ['All meals in Main Dining Room and Windjammer', 'Live entertainment and shows', 'Access to pools, fitness center, and sports areas', 'Kids & teens clubs', 'FlowRider surf simulator and rock climbing wall']
  },
  freedomClass: {
    dining: ['Main Dining Room', 'Windjammer Marketplace', 'El Loco Fresh', 'Sorrento\'s Pizza', 'Park Café', 'Specialty restaurants (Chops Grille, Giovanni\'s, Izumi, etc.)'],
    entertainment: ['FlowRider surf simulator', 'Rock climbing wall', 'Ice skating rink', 'Mini golf', 'Casino Royale', 'Broadway-style shows', 'Comedy club', 'Live music venues'],
    recreation: ['H2O Zone kids aquapark', 'Splashaway Bay', 'Solarium adults-only pool', 'Main pools', 'Hot tubs', 'Full spa & salon', 'Fitness center', 'Sports court', 'Jogging track'],
    included: ['All meals in Main Dining Room and Windjammer', 'Live entertainment and Broadway shows', 'Access to pools, fitness center, and sports areas', 'Kids & teens clubs', 'FlowRider surf simulator and rock climbing wall']
  },
  voyagerClass: {
    dining: ['Main Dining Room', 'Windjammer Marketplace', 'El Loco Fresh', 'Park Café', 'Sorrento\'s Pizza', 'Specialty restaurants (Chops Grille, Giovanni\'s, etc.)'],
    entertainment: ['FlowRider surf simulator', 'Rock climbing wall', 'Ice skating rink', 'Mini golf', 'Casino Royale', 'Broadway-style shows', 'Live music venues', 'Comedy club'],
    recreation: ['Splashaway Bay kids waterpark', 'Solarium adults-only pool', 'Main pool', 'Hot tubs', 'Full spa & salon', 'Fitness center', 'Sports court', 'Jogging track'],
    included: ['All meals in Main Dining Room and Windjammer', 'Live entertainment', 'Access to pools, fitness center, and sports areas', 'Kids & teens clubs', 'Rock climbing wall']
  },
  radianceClass: {
    dining: ['Main Dining Room', 'Windjammer Café', 'Park Café', 'Specialty restaurants (Chops Grille, Giovanni\'s, etc.)'],
    entertainment: ['Rock climbing wall', 'Casino Royale', 'Broadway-style shows', 'Live music', 'Comedy shows', 'Mini golf', 'Stargazing platform'],
    recreation: ['Main pool', 'Solarium adults-only pool', 'Hot tubs', 'Full spa & salon', 'Fitness center', 'Sports court', 'Jogging track'],
    included: ['All meals in Main Dining Room and Windjammer', 'Live entertainment and shows', 'Access to pools, fitness center, and sports areas', 'Kids & teens clubs', 'Rock climbing wall']
  },
  visionClass: {
    dining: ['Main Dining Room', 'Windjammer Café', 'Specialty restaurants (Chops Grille, etc.)'],
    entertainment: ['Rock climbing wall', 'Casino', 'Theater shows', 'Live music', 'Karaoke nights', 'Trivia & game shows'],
    recreation: ['Pool deck', 'Solarium adults-only pool', 'Hot tubs', 'Spa & salon', 'Fitness center', 'Sports court', 'Jogging track'],
    included: ['All meals in Main Dining Room and Windjammer', 'Live entertainment and shows', 'Access to pools, fitness center, and sports areas', 'Kids & teens clubs']
  }
};

// ── fleet-data.js ─────────────────────────────────────────────────────────────
const fleetData = {
  royalCaribbean: [
    // ── Icon class ──
    {
      id: 'utopia-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Utopia of the Seas',
      ship_class: 'Icon class',
      year_built: 2024,
      gross_tonnage: 236857,
      passenger_capacity: 5698,
      crew: 2350,
      length_m: 347,
      decks: 18,
      description: 'Utopia of the Seas is totally transforming weekend vacations for good with bigger flavor, bolder play, and better chill days than you\'ve ever imagined. Sail from Port Canaveral to Perfect Day at CocoCay year-round.',
      image: '',
      amenities: amenities.iconClass
    },
    {
      id: 'star-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Star of the Seas',
      ship_class: 'Icon class',
      year_built: 2025,
      gross_tonnage: 250800,
      passenger_capacity: 7600,
      crew: 2350,
      length_m: 365,
      decks: 20,
      description: 'Star of the Seas is the newest Icon-class ship from Royal Caribbean, packed with next-level thrills, world-class dining, and unforgettable entertainment for every member of the family.',
      image: '',
      amenities: amenities.iconClass
    },
    // ── Quantum class ──
    {
      id: 'ovation-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Ovation of the Seas',
      ship_class: 'Quantum class',
      year_built: 2016,
      gross_tonnage: 168666,
      passenger_capacity: 4180,
      crew: 1500,
      length_m: 348,
      decks: 18,
      description: 'Ovation of the Seas combines thrilling activities with sleek, sophisticated design. Experience indoor skydiving with RipCord by iFly, ride the NorthStar observation capsule 300 feet above sea level, and enjoy spectacular entertainment in Two70.',
      image: '',
      amenities: amenities.quantumClass
    },
    {
      id: 'spectrum-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Spectrum of the Seas',
      ship_class: 'Quantum Ultra class',
      year_built: 2019,
      gross_tonnage: 169379,
      passenger_capacity: 4246,
      crew: 1551,
      length_m: 347,
      decks: 18,
      description: 'Spectrum of the Seas is a Quantum Ultra-class ship tailored for guests sailing in Asia, featuring the Ultimate Family Suite, The Limelight entertainment venue, and a Star of the Seas dining hall inspired by local flavors.',
      image: '',
      amenities: amenities.quantumClass
    },
    {
      id: 'odyssey-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Odyssey of the Seas',
      ship_class: 'Quantum Ultra class',
      year_built: 2021,
      gross_tonnage: 169379,
      passenger_capacity: 4198,
      crew: 1551,
      length_m: 347,
      decks: 18,
      description: 'Odyssey of the Seas delivers sky-high thrills and dazzling entertainment with the NorthStar observation capsule, indoor skydiving at RipCord by iFly, and the revolutionary Two70 venue with floor-to-ceiling ocean views.',
      image: '',
      amenities: amenities.quantumClass
    },
    // ── Freedom class ──
    {
      id: 'freedom-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Freedom of the Seas',
      ship_class: 'Freedom class',
      year_built: 2006,
      gross_tonnage: 154407,
      passenger_capacity: 4370,
      crew: 1360,
      length_m: 339,
      decks: 18,
      description: 'Freedom of the Seas was a groundbreaking ship when launched, pioneering the FlowRider surf simulator and setting a new standard for onboard activities. Now Royal Amplified, it features new dining, a redesigned pool deck, and more thrills than ever.',
      image: '',
      amenities: amenities.freedomClass
    },
    {
      id: 'liberty-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Liberty of the Seas',
      ship_class: 'Freedom class',
      year_built: 2007,
      gross_tonnage: 154407,
      passenger_capacity: 4375,
      crew: 1397,
      length_m: 339,
      decks: 18,
      description: 'Liberty of the Seas delivers an amplified vacation experience with the H2O Zone kids waterpark, FlowRider surf simulator, and a vibrant array of dining venues and entertainment for the whole family.',
      image: '',
      amenities: amenities.freedomClass
    },
    {
      id: 'independence-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Independence of the Seas',
      ship_class: 'Freedom class',
      year_built: 2008,
      gross_tonnage: 154407,
      passenger_capacity: 4375,
      crew: 1394,
      length_m: 339,
      decks: 18,
      description: 'Independence of the Seas offers an action-packed vacation after her Royal Amplified makeover, featuring new water slides, Splashaway Bay waterpark, the Sugar Beach pool deck, and bold new dining and entertainment options.',
      image: '',
      amenities: amenities.freedomClass
    },
    // ── Voyager class ──
    {
      id: 'voyager-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Voyager of the Seas',
      ship_class: 'Voyager class',
      year_built: 1999,
      gross_tonnage: 137276,
      passenger_capacity: 3840,
      crew: 1181,
      length_m: 311,
      decks: 15,
      description: 'Voyager of the Seas was the first Royal Caribbean ship to feature the revolutionary Royal Promenade indoor boulevard, setting the stage for a new era of mega-ships. It still dazzles with a rock climbing wall, ice skating rink, and bustling entertainment.',
      image: '',
      amenities: amenities.voyagerClass
    },
    {
      id: 'explorer-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Explorer of the Seas',
      ship_class: 'Voyager class',
      year_built: 1999,
      gross_tonnage: 137308,
      passenger_capacity: 3840,
      crew: 1181,
      length_m: 311,
      decks: 15,
      description: 'Explorer of the Seas pioneered onboard entertainment at sea with its Royal Promenade indoor boulevard, rock climbing wall, and ice skating rink — innovations that changed cruising forever.',
      image: '',
      amenities: amenities.voyagerClass
    },
    {
      id: 'adventure-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Adventure of the Seas',
      ship_class: 'Voyager class',
      year_built: 2001,
      gross_tonnage: 137276,
      passenger_capacity: 3838,
      crew: 1181,
      length_m: 311,
      decks: 15,
      description: 'Adventure of the Seas lives up to its name with an action-packed lineup of thrills including a FlowRider surf simulator, climbing wall, ice skating rink, and a wide variety of dining and entertainment options.',
      image: '',
      amenities: amenities.voyagerClass
    },
    {
      id: 'navigator-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Navigator of the Seas',
      ship_class: 'Voyager class',
      year_built: 2002,
      gross_tonnage: 138279,
      passenger_capacity: 3838,
      crew: 1181,
      length_m: 311,
      decks: 15,
      description: 'Navigator of the Seas received a massive Royal Amplified makeover, adding The Lime & Coconut pool bar, Splashaway Bay aquapark, new restaurants, a reimagined Royal Promenade, and a stunning new pool deck.',
      image: '',
      amenities: amenities.voyagerClass
    },
    {
      id: 'mariner-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Mariner of the Seas',
      ship_class: 'Voyager class',
      year_built: 2003,
      gross_tonnage: 138279,
      passenger_capacity: 3838,
      crew: 1181,
      length_m: 311,
      decks: 15,
      description: 'Mariner of the Seas was transformed with a Royal Amplified upgrade adding a three-level waterslide, Splashaway Bay aquapark for kids, new dining spots, a mini golf course, and a rebuilt pool deck.',
      image: '',
      amenities: amenities.voyagerClass
    },
    // ── Radiance class ──
    {
      id: 'radiance-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Radiance of the Seas',
      ship_class: 'Radiance class',
      year_built: 2001,
      gross_tonnage: 90090,
      passenger_capacity: 2501,
      crew: 857,
      length_m: 293,
      decks: 12,
      description: 'Radiance of the Seas offers a sophisticated and intimate sailing experience with panoramic ocean views, elegant spaces, and a warm, personalized atmosphere perfect for exploring exotic destinations.',
      image: '',
      amenities: amenities.radianceClass
    },
    {
      id: 'brilliance-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Brilliance of the Seas',
      ship_class: 'Radiance class',
      year_built: 2002,
      gross_tonnage: 90090,
      passenger_capacity: 2501,
      crew: 857,
      length_m: 293,
      decks: 12,
      description: 'Brilliance of the Seas combines classic elegance with modern amenities, featuring stunning floor-to-ceiling windows, intimate dining, and personalized service on a beautifully appointed mid-sized vessel.',
      image: '',
      amenities: amenities.radianceClass
    },
    {
      id: 'serenade-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Serenade of the Seas',
      ship_class: 'Radiance class',
      year_built: 2003,
      gross_tonnage: 90090,
      passenger_capacity: 2501,
      crew: 857,
      length_m: 293,
      decks: 12,
      description: 'Serenade of the Seas is a beautiful mid-sized ship offering a serene and sophisticated cruising experience with stunning ocean vistas, elegant onboard spaces, and attentive personal service.',
      image: '',
      amenities: amenities.radianceClass
    },
    {
      id: 'jewel-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Jewel of the Seas',
      ship_class: 'Radiance class',
      year_built: 2004,
      gross_tonnage: 90090,
      passenger_capacity: 2501,
      crew: 857,
      length_m: 293,
      decks: 12,
      description: 'Jewel of the Seas sparkles with elegant design and attentive service, offering a more intimate cruise experience with panoramic ocean views and the variety and entertainment for which Royal Caribbean is celebrated.',
      image: '',
      amenities: amenities.radianceClass
    },
    // ── Vision class ──
    {
      id: 'vision-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Vision of the Seas',
      ship_class: 'Vision class',
      year_built: 1998,
      gross_tonnage: 78340,
      passenger_capacity: 2435,
      crew: 765,
      length_m: 279,
      decks: 11,
      description: 'Vision of the Seas offers a classic and comfortable cruising experience with modern comforts, beautiful ocean views, a variety of dining options, and a warm, welcoming atmosphere.',
      image: '',
      amenities: amenities.visionClass
    },
    {
      id: 'enchantment-of-the-seas',
      cruiseLineId: 'royal-caribbean',
      name: 'Enchantment of the Seas',
      ship_class: 'Vision class',
      year_built: 1997,
      gross_tonnage: 82910,
      passenger_capacity: 2730,
      crew: 840,
      length_m: 301,
      decks: 11,
      description: 'Enchantment of the Seas was lengthened and refurbished to add new dining and entertainment options, blending the timeless Royal Caribbean experience with refreshed modern amenities.',
      image: '',
      amenities: amenities.visionClass
    }
  ]
};

fs.writeFileSync(
  path.join(scraperDir, 'fleet-data.js'),
  'module.exports = ' + JSON.stringify(fleetData, null, 2) + ';\n'
);
console.log('Created fleet-data.js with ' + fleetData.royalCaribbean.length + ' missing Royal Caribbean ships');

// ── scrape.js ─────────────────────────────────────────────────────────────────
const scrapeJs = [
  "'use strict';",
  "const axios = require('axios');",
  "const cheerio = require('cheerio');",
  "const fs = require('fs');",
  "const path = require('path');",
  "const { royalCaribbean } = require('./fleet-data');",
  "",
  "const RC_BASE = 'https://www.royalcaribbean.com';",
  "const DELAY_MS = 1500;",
  "",
  "function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }",
  "",
  "async function scrapeShip(ship) {",
  "  const url = RC_BASE + '/cruise-ships/' + ship.id;",
  "  process.stdout.write('  Fetching ' + ship.name + '... ');",
  "  try {",
  "    const res = await axios.get(url, {",
  "      headers: {",
  "        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',",
  "        'Accept': 'text/html,application/xhtml+xml',",
  "        'Accept-Language': 'en-US,en;q=0.9',",
  "      },",
  "      timeout: 20000",
  "    });",
  "    const $ = cheerio.load(res.data);",
  "    const desc = $('meta[name=\"description\"]').attr('content') || '';",
  "    const img  = $('meta[property=\"og:image\"]').attr('content') || '';",
  "    process.stdout.write('OK\\n');",
  "    return Object.assign({}, ship, {",
  "      description: desc || ship.description,",
  "      image: img || ship.image",
  "    });",
  "  } catch (e) {",
  "    process.stdout.write('FAILED (' + e.message + ')\\n');",
  "    return ship;",
  "  }",
  "}",
  "",
  "async function main() {",
  "  console.log('Scraping ' + royalCaribbean.length + ' Royal Caribbean ships from royalcaribbean.com...\\n');",
  "  const results = [];",
  "  for (const ship of royalCaribbean) {",
  "    const scraped = await scrapeShip(ship);",
  "    results.push(scraped);",
  "    await sleep(DELAY_MS);",
  "  }",
  "  const outPath = path.join(__dirname, 'scraped', 'royal-caribbean.json');",
  "  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));",
  "  const ok = results.filter(s => s.image).length;",
  "  console.log('\\nDone! ' + ok + '/' + results.length + ' ships got images from official site.');",
  "  console.log('Saved to: ' + outPath);",
  "  console.log('\\nNext step: node merge.js');",
  "}",
  "",
  "main().catch(console.error);"
].join('\n');

fs.writeFileSync(path.join(scraperDir, 'scrape.js'), scrapeJs + '\n');
console.log('Created scrape.js');

// ── merge.js ──────────────────────────────────────────────────────────────────
const mergeJs = [
  "'use strict';",
  "const fs = require('fs');",
  "const path = require('path');",
  "",
  "const shipsPath   = path.join(__dirname, '..', 'server', 'data', 'ships.json');",
  "const scrapedPath = path.join(__dirname, 'scraped', 'royal-caribbean.json');",
  "",
  "if (!fs.existsSync(scrapedPath)) {",
  "  console.error('Error: scraped/royal-caribbean.json not found. Run node scrape.js first.');",
  "  process.exit(1);",
  "}",
  "",
  "const existing = JSON.parse(fs.readFileSync(shipsPath, 'utf8'));",
  "const scraped  = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));",
  "",
  "// Backup the current ships.json",
  "fs.writeFileSync(shipsPath + '.bak', JSON.stringify(existing, null, 2));",
  "console.log('Backup saved: ships.json.bak');",
  "",
  "let added = 0, updated = 0;",
  "",
  "for (const ship of scraped) {",
  "  const idx = existing.findIndex(s => s.id === ship.id);",
  "  if (idx === -1) {",
  "    existing.push(ship);",
  "    added++;",
  "    console.log('  + Added: ' + ship.name);",
  "  } else {",
  "    // Update description with official site version (always richer)",
  "    if (ship.description && ship.description.length > 40) {",
  "      existing[idx].description = ship.description;",
  "    }",
  "    // Only update image if current is empty",
  "    if (ship.image && !existing[idx].image) {",
  "      existing[idx].image = ship.image;",
  "    }",
  "    updated++;",
  "  }",
  "}",
  "",
  "fs.writeFileSync(shipsPath, JSON.stringify(existing, null, 2));",
  "console.log('\\nDone!');",
  "console.log('  Added:   ' + added + ' new ships');",
  "console.log('  Updated: ' + updated + ' existing ships');",
  "console.log('  Total:   ' + existing.length + ' ships in ships.json');"
].join('\n');

fs.writeFileSync(path.join(scraperDir, 'merge.js'), mergeJs + '\n');
console.log('Created merge.js');

console.log('\n══════════════════════════════════════════════════');
console.log('Setup complete! Now run the scraper:');
console.log('');
console.log('  cd scraper');
console.log('  npm install');
console.log('  node scrape.js');
console.log('  node merge.js');
console.log('');
console.log('This will:');
console.log('  1. Install axios + cheerio (no Chromium needed)');
console.log('  2. Fetch all 19 missing Royal Caribbean ships from royalcaribbean.com');
console.log('     (gets official descriptions & images via meta tags)');
console.log('  3. Merge into server/data/ships.json');
console.log('     (Royal Caribbean fleet: 8 → 27 ships)');
console.log('══════════════════════════════════════════════════');
