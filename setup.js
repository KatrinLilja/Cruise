/**
 * Cruises App Setup Script
 * Run: node setup.js
 * This will scaffold the full project structure and install dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = __dirname;

function write(filePath, content) {
  const abs = path.join(BASE, filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('  created:', filePath);
}

console.log('\n=== Creating server files ===');

write('server/package.json', JSON.stringify({
  name: "cruises-server",
  version: "1.0.0",
  description: "Express API for Cruises app",
  main: "index.js",
  scripts: { start: "node index.js", dev: "nodemon index.js" },
  dependencies: { cors: "^2.8.5", express: "^4.18.2" },
  devDependencies: { nodemon: "^3.0.1" }
}, null, 2));

write('server/index.js', `const express = require('express');
const cors = require('cors');
const cruiseLinesRouter = require('./routes/cruiseLines');
const shipsRouter = require('./routes/ships');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/cruise-lines', cruiseLinesRouter);
app.use('/api/ships', shipsRouter);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`);

write('server/routes/cruiseLines.js', `const express = require('express');
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
`);

write('server/routes/ships.js', `const express = require('express');
const router = express.Router();
const ships = require('../data/ships.json');

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
`);

write('server/data/cruiseLines.json', JSON.stringify([
  {
    id: "royal-caribbean",
    name: "Royal Caribbean",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Royal_Caribbean_logo.svg/320px-Royal_Caribbean_logo.svg.png",
    founded: 1968,
    headquarters: "Miami, Florida, USA",
    description: "Royal Caribbean International is a global cruise vacation company and the world's second largest cruise line by revenue. Known for its innovative ships and wide variety of onboard activities, Royal Caribbean caters to families, couples, and adventure seekers.",
    website: "https://www.royalcaribbean.com",
    fleet_size: 26,
    destinations: ["Caribbean", "Mediterranean", "Alaska", "Europe", "Asia", "Australia"]
  },
  {
    id: "carnival",
    name: "Carnival Cruise Line",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Carnival_Cruise_Lines_logo.svg/320px-Carnival_Cruise_Lines_logo.svg.png",
    founded: 1972,
    headquarters: "Miami, Florida, USA",
    description: "Carnival Cruise Line is the largest cruise brand in the world, known for its fun-focused atmosphere, vibrant entertainment, and affordable pricing. It is the flagship brand of Carnival Corporation & plc, operating 24 ships.",
    website: "https://www.carnival.com",
    fleet_size: 24,
    destinations: ["Caribbean", "Mexico", "Bahamas", "Europe", "Alaska", "Hawaii"]
  },
  {
    id: "norwegian",
    name: "Norwegian Cruise Line",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Norwegian_Cruise_Line_logo.svg/320px-Norwegian_Cruise_Line_logo.svg.png",
    founded: 1966,
    headquarters: "Miami, Florida, USA",
    description: "Norwegian Cruise Line (NCL) pioneered freestyle cruising, giving guests the freedom to dine when and where they want, with no set times or assigned seating. NCL is known for its innovative ships, specialty dining, and Broadway-style entertainment.",
    website: "https://www.ncl.com",
    fleet_size: 19,
    destinations: ["Caribbean", "Alaska", "Europe", "Bermuda", "Hawaii", "Asia"]
  },
  {
    id: "msc",
    name: "MSC Cruises",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/MSC_Cruises_logo.svg/320px-MSC_Cruises_logo.svg.png",
    founded: 1987,
    headquarters: "Geneva, Switzerland",
    description: "MSC Cruises is the world's third largest cruise brand and the largest privately-owned cruise line. Founded by the Mediterranean Shipping Company, MSC combines European elegance with a multi-cultural experience, catering to passengers from more than 180 countries.",
    website: "https://www.msccruises.com",
    fleet_size: 21,
    destinations: ["Mediterranean", "Caribbean", "Northern Europe", "South America", "Africa", "Middle East"]
  },
  {
    id: "celebrity",
    name: "Celebrity Cruises",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Celebrity_Cruises_logo.svg/320px-Celebrity_Cruises_logo.svg.png",
    founded: 1988,
    headquarters: "Miami, Florida, USA",
    description: "Celebrity Cruises is a premium cruise line offering a more upscale experience than mainstream lines. Known for its modern luxury ships, award-winning culinary programs, and destination-focused itineraries, Celebrity appeals to discerning travelers looking for a refined cruise experience.",
    website: "https://www.celebritycruises.com",
    fleet_size: 15,
    destinations: ["Caribbean", "Mediterranean", "Alaska", "Europe", "Galápagos", "South America"]
  }
], null, 2));

// Ships data — read from the existing ships.json (single source of truth).
// If the file doesn't exist yet on a fresh checkout, an empty array is used.
{
  const shipsJsonPath = path.join(BASE, 'server', 'data', 'ships.json');
  const shipsContent = fs.existsSync(shipsJsonPath)
    ? fs.readFileSync(shipsJsonPath, 'utf8')
    : JSON.stringify([], null, 2);
  write('server/data/ships.json', shipsContent);
}

console.log('\n=== Creating client files ===');

write('client/index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/anchor.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cruises</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

write('client/package.json', JSON.stringify({
  name: "cruises-client",
  version: "1.0.0",
  private: true,
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  devDependencies: {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    autoprefixer: "^10.4.17",
    postcss: "^8.4.33",
    tailwindcss: "^3.4.1",
    vite: "^5.1.0"
  }
}, null, 2));
write('client/vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
`);

REMOVE_MARKER_START
    cruiseLineId: "celebrity",
    name: "Celebrity Ascent",
    year_built: 2023,
    gross_tonnage: 141420,
    passenger_capacity: 3260,
    crew: 1410,
    length_m: 327,
    decks: 20,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Celebrity_Ascent.jpg/640px-Celebrity_Ascent.jpg",
    ship_class: "Edge class",
    description: "Celebrity Ascent is the fourth and newest ship in the Edge class. It features an expanded roster of design collaborators, 32 dining and bar experiences, a redesigned Eden restaurant, and the iconic Magic Carpet. It offers sailings across Europe and the Caribbean."
  },
  // Royal Caribbean additions
  {
    id: "harmony-of-the-seas",
    cruiseLineId: "royal-caribbean",
    name: "Harmony of the Seas",
    year_built: 2016,
    gross_tonnage: 226963,
    passenger_capacity: 6687,
    crew: 2100,
    length_m: 362,
    decks: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Harmony_of_the_Seas_%2827424448003%29.jpg/640px-Harmony_of_the_Seas_%2827424448003%29.jpg",
    ship_class: "Oasis class",
    description: "Harmony of the Seas was the world's largest cruise ship when it launched in 2016. The third Oasis-class vessel features 20 restaurants and bars, a 10-story slide called The Ultimate Abyss, a FlowRider surf simulator, and the beloved Central Park and Boardwalk neighborhoods."
  },
  {
    id: "allure-of-the-seas",
    cruiseLineId: "royal-caribbean",
    name: "Allure of the Seas",
    year_built: 2010,
    gross_tonnage: 225282,
    passenger_capacity: 6296,
    crew: 2384,
    length_m: 362,
    decks: 16,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Allure_of_the_Seas_Jan_2012.jpg/640px-Allure_of_the_Seas_Jan_2012.jpg",
    ship_class: "Oasis class",
    description: "Allure of the Seas is the second Oasis-class ship, launched in 2010. After a major amplification in 2020, it received new waterslides, a redesigned Boardwalk, updated dining including Sabor Modern Mexican, and a refreshed pool deck."
  },
  {
    id: "oasis-of-the-seas",
    cruiseLineId: "royal-caribbean",
    name: "Oasis of the Seas",
    year_built: 2009,
    gross_tonnage: 225282,
    passenger_capacity: 6296,
    crew: 2165,
    length_m: 362,
    decks: 16,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Oasis_of_the_Seas_Jan_2012.jpg/640px-Oasis_of_the_Seas_Jan_2012.jpg",
    ship_class: "Oasis class",
    description: "Oasis of the Seas pioneered a new era of cruising when it debuted in 2009 as the first Oasis-class ship. It introduced the revolutionary neighborhood concept — seven distinct areas including a Central Park, Boardwalk, and Royal Promenade — that transformed modern cruise ship design."
  },
  {
    id: "quantum-of-the-seas",
    cruiseLineId: "royal-caribbean",
    name: "Quantum of the Seas",
    year_built: 2014,
    gross_tonnage: 168666,
    passenger_capacity: 4905,
    crew: 1500,
    length_m: 348,
    decks: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Quantum_of_the_Seas_Singapore.jpg/640px-Quantum_of_the_Seas_Singapore.jpg",
    ship_class: "Quantum class",
    description: "Quantum of the Seas introduced a wave of innovations when it launched in 2014, including the North Star observation pod that lifts guests 300 feet above sea level, RipCord by iFly skydiving simulator, and Two70 — an immersive entertainment venue with 270-degree views."
  },
  {
    id: "anthem-of-the-seas",
    cruiseLineId: "royal-caribbean",
    name: "Anthem of the Seas",
    year_built: 2015,
    gross_tonnage: 168666,
    passenger_capacity: 4905,
    crew: 1500,
    length_m: 348,
    decks: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Anthem_of_the_Seas_Southampton.jpg/640px-Anthem_of_the_Seas_Southampton.jpg",
    ship_class: "Quantum class",
    description: "Anthem of the Seas is the second Quantum-class ship and the largest ship based year-round in the UK. It shares its sister ship's signature innovations — North Star, iFly, Two70 — and is known for its Wonderland surrealist restaurant and SeaPlex, the largest indoor activity complex at sea."
  },
  // Carnival additions
  {
    id: "carnival-dream",
    cruiseLineId: "carnival",
    name: "Carnival Dream",
    year_built: 2009,
    gross_tonnage: 130000,
    passenger_capacity: 3646,
    crew: 1367,
    length_m: 306,
    decks: 13,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Carnival_Dream_%28ship%2C_2009%29.jpg/640px-Carnival_Dream_%28ship%2C_2009%29.jpg",
    ship_class: "Dream class",
    description: "Carnival Dream was the largest Carnival ship at its launch in 2009 and the first of the Dream class. It introduced the expanded WaterWorks aqua park, the adults-only Serenity retreat, and the Ocean Plaza entertainment venue — features that became standard on future Carnival ships."
  },
  {
    id: "carnival-magic",
    cruiseLineId: "carnival",
    name: "Carnival Magic",
    year_built: 2011,
    gross_tonnage: 130000,
    passenger_capacity: 3690,
    crew: 1367,
    length_m: 306,
    decks: 13,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Carnival_Magic_%28ship%2C_2011%29.jpg/640px-Carnival_Magic_%28ship%2C_2011%29.jpg",
    ship_class: "Dream class",
    description: "Carnival Magic is the second Dream-class ship, launched in 2011 for European itineraries before relocating to the US. It was one of the first ships to feature the popular Guy's Burger Joint, a partnership with Food Network personality Guy Fieri."
  },
  {
    id: "carnival-breeze",
    cruiseLineId: "carnival",
    name: "Carnival Breeze",
    year_built: 2012,
    gross_tonnage: 130000,
    passenger_capacity: 3690,
    crew: 1386,
    length_m: 306,
    decks: 13,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Carnival_Breeze_%28ship%2C_2012%29.jpg/640px-Carnival_Breeze_%28ship%2C_2012%29.jpg",
    ship_class: "Dream class",
    description: "Carnival Breeze is the third and final Dream-class ship, launched in 2012. It added the BlueIguana Tequila Bar and RedFrog Rum Bar to the lineup of poolside venues and features a full-size EA SPORTS Bar — the first on any Carnival ship at the time of its debut."
  },
  {
    id: "carnival-vista",
    cruiseLineId: "carnival",
    name: "Carnival Vista",
    year_built: 2016,
    gross_tonnage: 133500,
    passenger_capacity: 3934,
    crew: 1450,
    length_m: 323,
    decks: 17,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Carnival_Vista_%28ship%2C_2016%29.jpg/640px-Carnival_Vista_%28ship%2C_2016%29.jpg",
    ship_class: "Vista class",
    description: "Carnival Vista introduced the Vista class in 2016 and debuted several firsts for Carnival: SkyRide — a pedal-powered aerial cycling attraction — IMAX Theater at sea, Havana staterooms and pool, and the Bonsai Sushi restaurant. It set the template for the modern Carnival experience."
  },
  {
    id: "carnival-horizon",
    cruiseLineId: "carnival",
    name: "Carnival Horizon",
    year_built: 2018,
    gross_tonnage: 133500,
    passenger_capacity: 3934,
    crew: 1450,
    length_m: 323,
    decks: 17,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Carnival_Horizon_%28ship%2C_2018%29.jpg/640px-Carnival_Horizon_%28ship%2C_2018%29.jpg",
    ship_class: "Vista class",
    description: "Carnival Horizon is the second Vista-class ship. It added Chef's Table Lumiere — an intimate fine dining experience — and Dr. Seuss Bookville to the lineup. The ship homeports in Miami and New York, offering Caribbean and Bahamas itineraries."
  },
  // Norwegian additions
  {
    id: "norwegian-bliss",
    cruiseLineId: "norwegian",
    name: "Norwegian Bliss",
    year_built: 2018,
    gross_tonnage: 168028,
    passenger_capacity: 4010,
    crew: 1716,
    length_m: 333,
    decks: 20,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Norwegian_Bliss_%2841310524025%29.jpg/640px-Norwegian_Bliss_%2841310524025%29.jpg",
    ship_class: "Breakaway Plus class",
    description: "Norwegian Bliss was purpose-built for Alaska and Caribbean itineraries. It features the largest race track at sea at the time of its launch, an outdoor laser tag arena, the Galaxy Pavilion virtual reality complex, and two brand-new high-speed waterslides called the Ocean Loops."
  },
  {
    id: "norwegian-joy",
    cruiseLineId: "norwegian",
    name: "Norwegian Joy",
    year_built: 2017,
    gross_tonnage: 167725,
    passenger_capacity: 3776,
    crew: 1821,
    length_m: 333,
    decks: 20,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Norwegian_Joy.jpg/640px-Norwegian_Joy.jpg",
    ship_class: "Breakaway Plus class",
    description: "Norwegian Joy was originally built for the Chinese market before being refurbished for the American market in 2019. Now sailing Caribbean and Alaska routes, it features a two-level racetrack, the Aqua Racer waterslide, and venues designed specifically for the North American guest experience."
  },
  {
    id: "norwegian-escape",
    cruiseLineId: "norwegian",
    name: "Norwegian Escape",
    year_built: 2015,
    gross_tonnage: 164998,
    passenger_capacity: 4218,
    crew: 1733,
    length_m: 326,
    decks: 20,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Norwegian_Escape_%2822477481863%29.jpg/640px-Norwegian_Escape_%2822477481863%29.jpg",
    ship_class: "Breakaway class",
    description: "Norwegian Escape is the largest Breakaway-class ship. It features a five-story go-kart race track, the Aqua Park with three multi-story waterslides, and award-winning Broadway entertainment."
  },
  {
    id: "norwegian-breakaway",
    cruiseLineId: "norwegian",
    name: "Norwegian Breakaway",
    year_built: 2013,
    gross_tonnage: 145655,
    passenger_capacity: 3903,
    crew: 1657,
    length_m: 326,
    decks: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Norwegian_Breakaway.jpg/640px-Norwegian_Breakaway.jpg",
    ship_class: "Breakaway class",
    description: "Norwegian Breakaway was the first of NCL's Breakaway class when it launched from New York in 2013. The ship introduced the iconic Waterfront — a quarter-mile outdoor promenade with restaurants and bars overlooking the ocean — and the thrilling five-story Aqua Park waterslides."
  },
  {
    id: "norwegian-viva",
    cruiseLineId: "norwegian",
    name: "Norwegian Viva",
    year_built: 2023,
    gross_tonnage: 142500,
    passenger_capacity: 3195,
    crew: 1506,
    length_m: 294,
    decks: 17,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Norwegian_Viva.jpg/640px-Norwegian_Viva.jpg",
    ship_class: "Prima class",
    description: "Norwegian Viva is the second Prima-class ship, launched in 2023. Like its sister ship Norwegian Prima, it features more outdoor deck space per guest than any other large ship. The Prima class is defined by its distinctive hull design, three-deck race track, and elevated dining and entertainment options."
  },
  // MSC additions
  {
    id: "msc-grandiosa",
    cruiseLineId: "msc",
    name: "MSC Grandiosa",
    year_built: 2019,
    gross_tonnage: 181541,
    passenger_capacity: 6334,
    crew: 1704,
    length_m: 331,
    decks: 19,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/MSC_Grandiosa.jpg/640px-MSC_Grandiosa.jpg",
    ship_class: "Meraviglia Plus class",
    description: "MSC Grandiosa is the first Meraviglia Plus class ship. Longer than the original Meraviglia class, it features an 80-meter LED sky dome, the largest duty-free promenade at sea, and Cirque du Soleil at Sea performances in a purpose-built venue."
  },
  {
    id: "msc-virtuosa",
    cruiseLineId: "msc",
    name: "MSC Virtuosa",
    year_built: 2021,
    gross_tonnage: 181541,
    passenger_capacity: 6334,
    crew: 1704,
    length_m: 331,
    decks: 19,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/MSC_Virtuosa.jpg/640px-MSC_Virtuosa.jpg",
    ship_class: "Meraviglia Plus class",
    description: "MSC Virtuosa is the second Meraviglia Plus class ship. It made history as the first cruise ship to deploy an AI-powered robotic bartender named Rob. It also features the MSC Yacht Club private enclave and Cirque du Soleil at Sea entertainment."
  },
  {
    id: "msc-meraviglia",
    cruiseLineId: "msc",
    name: "MSC Meraviglia",
    year_built: 2017,
    gross_tonnage: 167600,
    passenger_capacity: 5714,
    crew: 1536,
    length_m: 315,
    decks: 19,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/MSC_Meraviglia.jpg/640px-MSC_Meraviglia.jpg",
    ship_class: "Meraviglia class",
    description: "MSC Meraviglia introduced the Meraviglia class in 2017. The ship features a 93-meter LED dome in the main promenade — one of the most recognizable features at sea — along with the first bowling alley on an MSC ship and an XD Cinema."
  },
  {
    id: "msc-bellissima",
    cruiseLineId: "msc",
    name: "MSC Bellissima",
    year_built: 2019,
    gross_tonnage: 167600,
    passenger_capacity: 5686,
    crew: 1536,
    length_m: 315,
    decks: 19,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/MSC_Bellissima.jpg/640px-MSC_Bellissima.jpg",
    ship_class: "Meraviglia class",
    description: "MSC Bellissima launched in 2019 as the second Meraviglia-class ship. It debuted ZOE — an AI-powered virtual personal assistant available in every cabin — a world first in the cruise industry."
  },
  {
    id: "msc-seascape",
    cruiseLineId: "msc",
    name: "MSC Seascape",
    year_built: 2022,
    gross_tonnage: 169400,
    passenger_capacity: 5877,
    crew: 1648,
    length_m: 339,
    decks: 22,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/MSC_Seascape.jpg/640px-MSC_Seascape.jpg",
    ship_class: "Seaside EVO class",
    description: "MSC Seascape is the second Seaside EVO class ship, deployed year-round in Miami for Caribbean cruising. It features the Cliffhanger roller coaster-style waterslide that extends 40 feet beyond the ship's edge, a new Aft Pool area, and expanded family entertainment."
  },
  // Celebrity additions
  {
    id: "celebrity-edge",
    cruiseLineId: "celebrity",
    name: "Celebrity Edge",
    year_built: 2018,
    gross_tonnage: 130818,
    passenger_capacity: 2918,
    crew: 1320,
    length_m: 306,
    decks: 16,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Celebrity_Edge_ship.jpg/640px-Celebrity_Edge_ship.jpg",
    ship_class: "Edge class",
    description: "Celebrity Edge launched in 2018 and completely redefined Celebrity Cruises' design language. It was the first ship to feature the Magic Carpet — a cantilevered floating platform that glides up and down the ship's exterior serving as a restaurant, bar, and embarkation point. It also introduced The Retreat luxury enclave."
  },
  {
    id: "celebrity-apex",
    cruiseLineId: "celebrity",
    name: "Celebrity Apex",
    year_built: 2020,
    gross_tonnage: 130818,
    passenger_capacity: 2910,
    crew: 1316,
    length_m: 306,
    decks: 16,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Celebrity_Apex.jpg/640px-Celebrity_Apex.jpg",
    ship_class: "Edge class",
    description: "Celebrity Apex is the second Edge-class ship. It features the same groundbreaking design as Celebrity Edge including the Magic Carpet and The Retreat. Apex introduced an enhanced culinary program with Fine Cut Steakhouse and primarily sails European itineraries."
  },
  {
    id: "celebrity-millennium",
    cruiseLineId: "celebrity",
    name: "Celebrity Millennium",
    year_built: 2000,
    gross_tonnage: 91011,
    passenger_capacity: 2218,
    crew: 999,
    length_m: 294,
    decks: 11,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Celebrity_Millennium_in_Juneau.jpg/640px-Celebrity_Millennium_in_Juneau.jpg",
    ship_class: "Millennium class",
    description: "Celebrity Millennium launched in 2000 as the first of the Millennium class. It underwent a major 'revolutionized' refurbishment in 2019, gaining new specialty restaurants, a redesigned The Retreat, and updated staterooms while retaining its classic elegance."
  },
  {
    id: "celebrity-equinox",
    cruiseLineId: "celebrity",
    name: "Celebrity Equinox",
    year_built: 2009,
    gross_tonnage: 121878,
    passenger_capacity: 2852,
    crew: 1253,
    length_m: 317,
    decks: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Celebrity_Equinox.jpg/640px-Celebrity_Equinox.jpg",
    ship_class: "Solstice class",
    description: "Celebrity Equinox is the second Solstice-class ship, famous for its real lawn on the top deck — The Lawn Club — the first real grass lawn at sea. After its 2019 Revolution refurbishment, it gained Eden: a bar, restaurant, and entertainment space spanning three decks."
  },
  {
    id: "celebrity-reflection",
    cruiseLineId: "celebrity",
    name: "Celebrity Reflection",
    year_built: 2012,
    gross_tonnage: 125366,
    passenger_capacity: 3046,
    crew: 1253,
    length_m: 319,
    decks: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Celebrity_Reflection.jpg/640px-Celebrity_Reflection.jpg",
    ship_class: "Solstice class",
    description: "Celebrity Reflection is the fifth and largest Solstice-class ship. Refurbished in 2020 as part of Celebrity's Revolution program, it received a redesigned The Retreat, new suite classes, and is known for its extensive art collection of over 3,500 original works on board."
  },
  {
    id: "celebrity-eclipse",
    cruiseLineId: "celebrity",
    name: "Celebrity Eclipse",
    year_built: 2010,
    gross_tonnage: 121878,
    passenger_capacity: 2852,
    crew: 1253,
    length_m: 317,
    decks: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Celebrity_Eclipse.jpg/640px-Celebrity_Eclipse.jpg",
    ship_class: "Solstice class",
    description: "Celebrity Eclipse is the third Solstice-class ship, homeporting in Southampton, UK. It is the most popular Celebrity ship for British travelers. After the Celebrity Revolution refurbishment, it features the iconic Lawn Club, Martini Bar and Crush, and the atmospheric Cellar Masters wine bar."
  },
  {
    id: "celebrity-silhouette",
    cruiseLineId: "celebrity",
    name: "Celebrity Silhouette",
    year_built: 2011,
    gross_tonnage: 122210,
    passenger_capacity: 2902,
    crew: 1253,
    length_m: 319,
    decks: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Celebrity_Silhouette.jpg/640px-Celebrity_Silhouette.jpg",
    ship_class: "Solstice class",
    description: "Celebrity Silhouette is the fourth Solstice-class ship. Launched in 2011, it was the first Celebrity ship to feature The Lawn Club Grill, an interactive outdoor dining experience on the ship's famous grass lawn. Following its Celebrity Revolution refurbishment, Silhouette now features updated staterooms, The Retreat, and contemporary dining venues."
  },
  {
    id: "celebrity-solstice",
    cruiseLineId: "celebrity",
    name: "Celebrity Solstice",
    year_built: 2008,
    gross_tonnage: 121878,
    passenger_capacity: 2850,
    crew: 1253,
    length_m: 317,
    decks: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Celebrity_Solstice.jpg/640px-Celebrity_Solstice.jpg",
    ship_class: "Solstice class",
    description: "Celebrity Solstice was the first ship in Celebrity's groundbreaking Solstice class, launched in 2008. It introduced the revolutionary real grass Lawn Club on the top deck — a first in the cruise industry. Following a 2023 renewal, the Renewed Celebrity Solstice offers updated amenities, new dining venues, and modernized staterooms."
  },
  {
    id: "celebrity-constellation",
    cruiseLineId: "celebrity",
    name: "Celebrity Constellation",
    year_built: 2002,
    gross_tonnage: 90940,
    passenger_capacity: 2184,
    crew: 999,
    length_m: 294,
    decks: 11,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Celebrity_Constellation.jpg/640px-Celebrity_Constellation.jpg",
    ship_class: "Millennium class",
    description: "Celebrity Constellation is the fourth Millennium-class ship. After its Celebrity Revolution refurbishment, it features updated suites, a redesigned The Retreat sundeck, and contemporary dining options. It is known for its art collection, including works by Dale Chihuly, and its classic Celebrity elegance."
  },
  {
    id: "celebrity-infinity",
    cruiseLineId: "celebrity",
    name: "Celebrity Infinity",
    year_built: 2001,
    gross_tonnage: 90940,
    passenger_capacity: 2170,
    crew: 999,
    length_m: 294,
    decks: 11,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Celebrity_Infinity.jpg/640px-Celebrity_Infinity.jpg",
    ship_class: "Millennium class",
    description: "Celebrity Infinity is the second Millennium-class ship. It was among the first Celebrity ships to undergo the Celebrity Revolution refurbishment program, receiving a full interior redesign, new suite experiences, and updated dining venues. The ship primarily sails Alaska and South America itineraries."
  },
  {
    id: "celebrity-summit",
    cruiseLineId: "celebrity",
    name: "Celebrity Summit",
    year_built: 2001,
    gross_tonnage: 91003,
    passenger_capacity: 2218,
    crew: 999,
    length_m: 294,
    decks: 11,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Celebrity_Summit_in_Bermuda.jpg/640px-Celebrity_Summit_in_Bermuda.jpg",
    ship_class: "Millennium class",
    description: "Celebrity Summit is the third Millennium-class ship. Revolutionized in 2019, it homeports in Bayonne, New Jersey — the closest Celebrity ship to New York City. It serves the popular Bermuda and Canada/New England routes, offering an accessible taste of Celebrity's premium experience for East Coast travelers."
  },
  {
    id: "celebrity-flora",
    cruiseLineId: "celebrity",
    name: "Celebrity Flora",
    year_built: 2019,
    gross_tonnage: 5922,
    passenger_capacity: 100,
    crew: 70,
    length_m: 101,
    decks: 5,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Celebrity_Flora.jpg/640px-Celebrity_Flora.jpg",
    ship_class: "Flora class",
    description: "Celebrity Flora is a unique expedition yacht purpose-built exclusively for Galápagos Islands cruises. As the first purpose-built ship for the Galápagos, it accommodates only 100 guests, offering an intimate eco-adventure experience. The ship carries zodiacs, snorkeling gear, kayaks, and glass-bottom boats for exploring the islands' remote wildlife sanctuaries."
  },
  {
    id: "celebrity-xcel",
    cruiseLineId: "celebrity",
    name: "Celebrity Xcel",
    year_built: 2025,
    gross_tonnage: 141420,
    passenger_capacity: 3260,
    crew: 1410,
    length_m: 327,
    decks: 20,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Celebrity_Beyond.jpg/640px-Celebrity_Beyond.jpg",
    ship_class: "Edge class",
    description: "Celebrity Xcel is the fifth and newest ship in Celebrity's Edge class, debuting in 2025. The most technologically advanced ship in the Celebrity fleet, Xcel features the signature Magic Carpet cantilevered platform, upgraded Edge Staterooms, and the latest iteration of Celebrity's award-winning restaurant and entertainment concepts."
  }
], null, 2));

console.log('\n=== Creating client files ===');

write('client/index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/anchor.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cruises</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

write('client/package.json', JSON.stringify({
  name: "cruises-client",
  version: "1.0.0",
  private: true,
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  devDependencies: {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    autoprefixer: "^10.4.17",
    postcss: "^8.4.33",
    tailwindcss: "^3.4.1",
    vite: "^5.1.0"
  }
}, null, 2));

write('client/vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
`);

write('client/tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      }
    }
  },
  plugins: []
};
`);

write('client/postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`);

write('client/src/main.jsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

write('client/src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
`);

write('client/src/App.jsx', `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CruiseLinePage from './pages/CruiseLinePage';
import ShipPage from './pages/ShipPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cruise-lines/:id" element={<CruiseLinePage />} />
            <Route path="/ships/:id" element={<ShipPage />} />
          </Routes>
        </main>
        <footer className="bg-ocean-900 text-ocean-200 text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Cruises &mdash; Explore the world's finest cruise lines
        </footer>
      </div>
    </BrowserRouter>
  );
}
`);

write('client/src/components/Navbar.jsx', `import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-ocean-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ocean-700 hover:text-ocean-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18l9-14 9 14H3z" opacity="0.15" />
            <path fillRule="evenodd" d="M12 2a1 1 0 01.894.553l9 14A1 1 0 0121 18H3a1 1 0 01-.894-1.447l9-14A1 1 0 0112 2zm0 3.118L5.118 16h13.764L12 5.118z" clipRule="evenodd" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Cruises</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={\`transition-colors \${pathname === '/' ? 'text-ocean-600 border-b-2 border-ocean-500 pb-0.5' : 'text-gray-500 hover:text-ocean-600'}\`}
          >
            Cruise Lines
          </Link>
        </nav>
      </div>
    </header>
  );
}
`);

write('client/src/components/CruiseLineCard.jsx', `import { Link } from 'react-router-dom';

export default function CruiseLineCard({ cruiseLine }) {
  return (
    <Link
      to={\`/cruise-lines/\${cruiseLine.id}\`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-ocean-200 transition-all duration-200 flex flex-col"
    >
      <div className="h-28 bg-ocean-50 flex items-center justify-center p-4">
        <img
          src={cruiseLine.logo}
          alt={\`\${cruiseLine.name} logo\`}
          className="max-h-20 max-w-full object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-ocean-700 transition-colors">
          {cruiseLine.name}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{cruiseLine.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
          <span>Founded {cruiseLine.founded}</span>
          <span>{cruiseLine.fleet_size} ships</span>
        </div>
      </div>
    </Link>
  );
}
`);

write('client/src/components/ShipCard.jsx', `import { Link } from 'react-router-dom';

export default function ShipCard({ ship }) {
  return (
    <Link
      to={\`/ships/\${ship.id}\`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-ocean-200 transition-all duration-200 flex flex-col"
    >
      <div className="h-44 bg-ocean-50 overflow-hidden">
        {ship.image ? (
          <img
            src={ship.image}
            alt={ship.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ocean-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-ocean-700 transition-colors">
          {ship.name}
        </h3>
        <p className="text-xs text-ocean-600 font-medium">{ship.ship_class}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ship.description}</p>
        <div className="flex gap-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
          <span>Built {ship.year_built}</span>
          <span>{ship.passenger_capacity?.toLocaleString()} guests</span>
        </div>
      </div>
    </Link>
  );
}
`);

write('client/src/pages/Home.jsx', `import { useEffect, useState } from 'react';
import CruiseLineCard from '../components/CruiseLineCard';

export default function Home() {
  const [cruiseLines, setCruiseLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/cruise-lines')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load cruise lines');
        return r.json();
      })
      .then(data => { setCruiseLines(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cruise Lines</h1>
        <p className="text-gray-500 mt-2">Browse the world's leading cruise lines and explore their fleets.</p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-medium">Could not load cruise lines</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-3 text-red-500">Make sure the server is running: <code>cd server && npm run dev</code></p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cruiseLines.map(cl => (
            <CruiseLineCard key={cl.id} cruiseLine={cl} />
          ))}
        </div>
      )}
    </div>
  );
}
`);

write('client/src/pages/CruiseLinePage.jsx', `import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ShipCard from '../components/ShipCard';

export default function CruiseLinePage() {
  const { id } = useParams();
  const [cruiseLine, setCruiseLine] = useState(null);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(\`/api/cruise-lines/\${id}\`).then(r => { if (!r.ok) throw new Error('Cruise line not found'); return r.json(); }),
      fetch(\`/api/ships?cruiseLineId=\${id}\`).then(r => r.json())
    ])
      .then(([cl, sh]) => { setCruiseLine(cl); setShips(sh); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ocean-600 hover:text-ocean-800 mb-6 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Cruise Lines
      </Link>

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col sm:flex-row gap-6 items-start">
        {cruiseLine.logo && (
          <div className="shrink-0 w-40 h-24 bg-ocean-50 rounded-xl flex items-center justify-center p-3">
            <img src={cruiseLine.logo} alt={\`\${cruiseLine.name} logo\`} className="max-h-full max-w-full object-contain" onError={e => { e.target.style.display='none'; }} />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{cruiseLine.name}</h1>
          <p className="text-gray-500 mt-3 leading-relaxed">{cruiseLine.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Stat label="Founded" value={cruiseLine.founded} />
            <Stat label="Headquarters" value={cruiseLine.headquarters} />
            <Stat label="Fleet size" value={\`\${cruiseLine.fleet_size} ships\`} />
          </div>
          {cruiseLine.destinations?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cruiseLine.destinations.map(d => (
                <span key={d} className="bg-ocean-50 text-ocean-700 text-xs font-medium px-3 py-1 rounded-full">
                  {d}
                </span>
              ))}
            </div>
          )}
          {cruiseLine.website && (
            <a href={cruiseLine.website} target="_blank" rel="noopener noreferrer"
               className="inline-block mt-4 text-sm text-ocean-600 hover:text-ocean-800 underline underline-offset-2">
              Visit official website &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Ships */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Fleet ({ships.length} ships)</h2>
      {ships.length === 0 ? (
        <p className="text-gray-400">No ships listed for this cruise line yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ships.map(ship => <ShipCard key={ship.id} ship={ship} />)}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ocean-50 rounded-lg px-4 py-2">
      <p className="text-ocean-500 text-xs uppercase tracking-wide font-medium">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}
`);

write('client/src/pages/ShipPage.jsx', `import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ShipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(\`/api/ships/\${id}\`)
      .then(r => { if (!r.ok) throw new Error('Ship not found'); return r.json(); })
      .then(data => { setShip(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-ocean-600 hover:text-ocean-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-gray-300">/</span>
        <Link to="/" className="text-ocean-600 hover:text-ocean-800 transition-colors">Cruise Lines</Link>
        <span className="text-gray-300">/</span>
        <Link to={\`/cruise-lines/\${ship.cruiseLineId}\`} className="text-ocean-600 hover:text-ocean-800 transition-colors capitalize">
          {ship.cruiseLineId.replace(/-/g, ' ')}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">{ship.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {ship.image && (
          <div className="h-64 sm:h-80 overflow-hidden">
            <img src={ship.image} alt={ship.name} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display='none'; }} />
          </div>
        )}
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{ship.name}</h1>
            <span className="bg-ocean-100 text-ocean-700 text-sm font-semibold px-4 py-1.5 rounded-full">{ship.ship_class}</span>
          </div>
          <p className="text-gray-500 mt-3 leading-relaxed text-base">{ship.description}</p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat label="Year Built" value={ship.year_built} />
            <Stat label="Gross Tonnage" value={ship.gross_tonnage?.toLocaleString() + ' GT'} />
            <Stat label="Passenger Capacity" value={ship.passenger_capacity?.toLocaleString()} />
            <Stat label="Crew" value={ship.crew?.toLocaleString()} />
            <Stat label="Length" value={ship.length_m + ' m'} />
            <Stat label="Decks" value={ship.decks} />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to={\`/cruise-lines/\${ship.cruiseLineId}\`}
              className="inline-flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              View all ships by {ship.cruiseLineId.replace(/-/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-ocean-500 text-xs uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}
`);

console.log('\n=== Installing server dependencies ===');
try {
  execSync('npm install', { cwd: path.join(BASE, 'server'), stdio: 'inherit' });
  console.log('  Server dependencies installed.');
} catch {
  console.warn('  Could not auto-install server deps. Run: cd server && npm install');
}

console.log('\n=== Installing client dependencies ===');
try {
  execSync('npm install', { cwd: path.join(BASE, 'client'), stdio: 'inherit' });
  console.log('  Client dependencies installed.');
} catch {
  console.warn('  Could not auto-install client deps. Run: cd client && npm install');
}

console.log(`
=== Setup complete! ===

To start the app:

  Terminal 1 (server):
    cd server
    npm run dev

  Terminal 2 (client):
    cd client
    npm run dev

Then open http://localhost:5173 in your browser.
`);
