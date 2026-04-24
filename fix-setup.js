// Run once: node fix-setup.js
// 1. Removes orphaned ship data and duplicate client sections from setup.js
// 2. Updates the ShipPage.jsx template in setup.js with amenities support

const fs = require('fs');
const path = require('path');

const setupPath = path.join(__dirname, 'setup.js');
const shipPagePath = path.join(__dirname, 'client', 'src', 'pages', 'ShipPage.jsx');

let content = fs.readFileSync(setupPath, 'utf8');

// ── Step 1: Remove the REMOVE_MARKER_START garbage block ──────────────────
const garbageStart = '\nREMOVE_MARKER_START';
const garbageEnd   = "\nwrite('client/tailwind.config.js',";

const garbageStartIdx = content.indexOf(garbageStart);
const garbageEndIdx   = content.indexOf(garbageEnd);

if (garbageStartIdx !== -1 && garbageEndIdx !== -1) {
  console.log(`Removing garbage block: chars ${garbageStartIdx}–${garbageEndIdx} (${garbageEndIdx - garbageStartIdx} chars)`);
  content = content.slice(0, garbageStartIdx) + content.slice(garbageEndIdx);
  console.log('  ✓ Garbage block removed');
} else if (garbageStartIdx === -1) {
  console.log('  ℹ  No REMOVE_MARKER_START found — garbage already clean');
} else {
  console.log('ERROR: Could not find tailwind.config.js write marker');
  process.exit(1);
}

// ── Step 2: Update the ShipPage.jsx template ──────────────────────────────
const rawShipPage = fs.readFileSync(shipPagePath, 'utf8');

// Escape for embedding inside a JS template literal
const escapedShipPage = rawShipPage
  .replace(/\\/g, '\\\\')  // backslashes first
  .replace(/`/g, '\\`')    // then backticks
  .replace(/\$\{/g, '\\${'); // then template expressions

const templateOpen  = "write('client/src/pages/ShipPage.jsx', `";
const templateClose = '\n`);';

const openIdx = content.indexOf(templateOpen);
if (openIdx === -1) {
  console.log('ERROR: Could not find ShipPage.jsx write marker in setup.js');
  process.exit(1);
}

const contentAfterOpen = openIdx + templateOpen.length;
const closeIdx = content.indexOf(templateClose, contentAfterOpen);
if (closeIdx === -1) {
  console.log('ERROR: Could not find end of ShipPage.jsx template in setup.js');
  process.exit(1);
}

console.log(`Replacing ShipPage.jsx template (chars ${contentAfterOpen}–${closeIdx})`);
content = content.slice(0, contentAfterOpen) + escapedShipPage + content.slice(closeIdx);
console.log('  ✓ ShipPage.jsx template updated');

// ── Write result ───────────────────────────────────────────────────────────
fs.writeFileSync(setupPath, content, 'utf8');
console.log('\nsetup.js fixed successfully!\n');

// ── Verify ─────────────────────────────────────────────────────────────────
const verify = fs.readFileSync(setupPath, 'utf8');
const markerCount = (verify.match(/REMOVE_MARKER_START/g) || []).length;
const clientFilesDups = (verify.match(/Creating client files/g) || []).length;
const amenitiesInTemplate = verify.includes('AmenityGroup');
console.log(`Verification:`);
console.log(`  REMOVE_MARKER_START occurrences : ${markerCount}  (expected 0)`);
console.log(`  "Creating client files" count   : ${clientFilesDups}  (expected 1)`);
console.log(`  AmenityGroup in ShipPage template: ${amenitiesInTemplate} (expected true)`);
