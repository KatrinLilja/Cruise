const fs = require('fs');
const path = require('path');

const shipsDir = path.join(__dirname, 'server', 'data', 'ships');

// Comprehensive lookup: shipId -> { regions, homeport }
const shipMeta = {
  // AZAMARA
  'azamara-journey':    { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'Asia'],                              homeport: 'Lisbon, Portugal' },
  'azamara-quest':      { regions: ['Mediterranean', 'Asia', 'Northern Europe', 'Indian Ocean'],                           homeport: 'Barcelona, Spain' },
  'azamara-pursuit':    { regions: ['Australia & New Zealand', 'Asia', 'Indian Ocean', 'Mediterranean'],                   homeport: 'Singapore' },
  'azamara-onward':     { regions: ['Northern Europe', 'South America', 'Mediterranean', 'Transatlantic'],                 homeport: 'Barcelona, Spain' },

  // CARNIVAL
  'mardi-gras':             { regions: ['Caribbean', 'Transatlantic'],                                         homeport: 'Port Canaveral, FL' },
  'carnival-celebration':   { regions: ['Caribbean', 'Transatlantic'],                                         homeport: 'Miami, FL' },
  'carnival-venezia':       { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'New York, NY' },
  'carnival-dream':         { regions: ['Caribbean', 'North America'],                                         homeport: 'New Orleans, LA' },
  'carnival-magic':         { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Port Canaveral, FL' },
  'carnival-breeze':        { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Miami, FL' },
  'carnival-vista':         { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Miami, FL' },
  'carnival-horizon':       { regions: ['Caribbean', 'Transatlantic'],                                         homeport: 'Miami, FL' },
  'carnival-jubilee':       { regions: ['Caribbean', 'North America'],                                         homeport: 'Galveston, TX' },
  'carnival-firenze':       { regions: ['Caribbean', 'Alaska', 'Pacific Islands'],                             homeport: 'Long Beach, CA' },
  'carnival-panorama':      { regions: ['Caribbean', 'Alaska', 'Pacific Islands'],                             homeport: 'Long Beach, CA' },
  'carnival-luminosa':      { regions: ['Australia & New Zealand', 'Pacific Islands'],                         homeport: 'Brisbane, Australia' },
  'carnival-splendor':      { regions: ['Australia & New Zealand', 'Pacific Islands'],                         homeport: 'Sydney, Australia' },
  'carnival-freedom':       { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Fort Lauderdale, FL' },
  'carnival-liberty':       { regions: ['Caribbean', 'North America'],                                         homeport: 'Port Canaveral, FL' },
  'carnival-valor':         { regions: ['Caribbean', 'North America'],                                         homeport: 'New Orleans, LA' },
  'carnival-miracle':       { regions: ['Alaska', 'Caribbean', 'Pacific Islands'],                             homeport: 'Seattle, WA' },
  'carnival-glory':         { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Port Canaveral, FL' },
  'carnival-encounter':     { regions: ['Caribbean', 'North America'],                                         homeport: 'Galveston, TX' },
  'carnival-conquest':      { regions: ['Caribbean', 'North America'],                                         homeport: 'New Orleans, LA' },
  'carnival-legend':        { regions: ['Caribbean', 'Transatlantic', 'Northern Europe'],                      homeport: 'Tampa, FL' },
  'carnival-adventure':     { regions: ['Caribbean', 'North America'],                                         homeport: 'Baltimore, MD' },
  'carnival-pride':         { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Baltimore, MD' },
  'carnival-spirit':        { regions: ['Australia & New Zealand', 'Pacific Islands', 'Asia'],                 homeport: 'Sydney, Australia' },
  'carnival-radiance':      { regions: ['Caribbean', 'North America'],                                         homeport: 'Tampa, FL' },
  'carnival-sunrise':       { regions: ['Caribbean', 'Transatlantic'],                                         homeport: 'New York, NY' },
  'carnival-paradise':      { regions: ['Caribbean', 'North America'],                                         homeport: 'Tampa, FL' },
  'carnival-elation':       { regions: ['Caribbean', 'North America'],                                         homeport: 'Jacksonville, FL' },
  'carnival-sunshine':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Charleston, SC' },

  // CELEBRITY
  'celebrity-beyond':       { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Fort Lauderdale, FL' },
  'celebrity-ascent':       { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Fort Lauderdale, FL' },
  'celebrity-edge':         { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Fort Lauderdale, FL' },
  'celebrity-apex':         { regions: ['Mediterranean', 'Northern Europe', 'Transatlantic'],                  homeport: 'Southampton, UK' },
  'celebrity-millennium':   { regions: ['Asia', 'Alaska', 'Pacific Islands'],                                  homeport: 'Yokohama, Japan' },
  'celebrity-equinox':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Fort Lauderdale, FL' },
  'celebrity-reflection':   { regions: ['Caribbean', 'Mediterranean'],                                         homeport: 'Fort Lauderdale, FL' },
  'celebrity-eclipse':      { regions: ['Australia & New Zealand', 'Alaska', 'South America'],                 homeport: 'Sydney, Australia' },
  'celebrity-silhouette':   { regions: ['Caribbean', 'Northern Europe', 'Mediterranean'],                      homeport: 'Southampton, UK' },
  'celebrity-solstice':     { regions: ['Alaska', 'Australia & New Zealand', 'Pacific Islands'],               homeport: 'Seattle, WA' },
  'celebrity-constellation':{ regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],                      homeport: 'Fort Lauderdale, FL' },
  'celebrity-infinity':     { regions: ['Alaska', 'Caribbean', 'South America'],                               homeport: 'Seattle, WA' },
  'celebrity-summit':       { regions: ['Caribbean', 'North America'],                                         homeport: 'Cape Liberty (Bayonne), NJ' },
  'celebrity-flora':        { regions: ['Pacific Islands', 'South America'],                                   homeport: 'Guayaquil, Ecuador' },
  'celebrity-xcel':         { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                        homeport: 'Fort Lauderdale, FL' },

  // COSTA
  'costa-fortuna':    { regions: ['Mediterranean', 'Caribbean'],                            homeport: 'Savona, Italy' },
  'costa-serena':     { regions: ['Asia', 'Indian Ocean'],                                  homeport: 'Shanghai, China' },
  'costa-pacifica':   { regions: ['Mediterranean'],                                         homeport: 'Savona, Italy' },
  'costa-deliziosa':  { regions: ['Mediterranean', 'South America', 'Asia'],               homeport: 'Venice, Italy' },
  'costa-favolosa':   { regions: ['Northern Europe', 'Mediterranean'],                      homeport: 'Trieste, Italy' },
  'costa-fascinosa':  { regions: ['Mediterranean', 'Transatlantic', 'Northern Europe'],     homeport: 'Trieste, Italy' },
  'costa-diadema':    { regions: ['Mediterranean'],                                         homeport: 'Savona, Italy' },
  'costa-smeralda':   { regions: ['Mediterranean', 'Northern Europe'],                      homeport: 'Savona, Italy' },
  'costa-toscana':    { regions: ['Mediterranean', 'Northern Europe'],                      homeport: 'Savona, Italy' },

  // CRYSTAL
  'crystal-symphony': { regions: ['Mediterranean', 'Caribbean', 'Northern Europe', 'Asia'],                              homeport: 'Lisbon, Portugal' },
  'crystal-serenity': { regions: ['Mediterranean', 'Caribbean', 'Arctic & Antarctica', 'Asia', 'South America'],         homeport: 'New York, NY' },

  // CUNARD
  'queen-mary-2':   { regions: ['Transatlantic', 'Caribbean', 'Mediterranean', 'Northern Europe'],           homeport: 'Southampton, UK' },
  'queen-victoria': { regions: ['Mediterranean', 'Northern Europe', 'Transatlantic', 'Caribbean'],           homeport: 'Southampton, UK' },
  'queen-elizabeth':{ regions: ['Australia & New Zealand', 'Asia', 'Mediterranean', 'Caribbean'],            homeport: 'Southampton, UK' },
  'queen-anne':     { regions: ['Mediterranean', 'Caribbean', 'Transatlantic', 'Northern Europe'],           homeport: 'Southampton, UK' },

  // DISNEY
  'disney-magic':     { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],   homeport: 'Port Canaveral, FL' },
  'disney-wonder':    { regions: ['Alaska', 'Caribbean', 'Pacific Islands'],          homeport: 'Seattle, WA' },
  'disney-dream':     { regions: ['Caribbean'],                                        homeport: 'Port Canaveral, FL' },
  'disney-fantasy':   { regions: ['Caribbean'],                                        homeport: 'Port Canaveral, FL' },
  'disney-wish':      { regions: ['Caribbean'],                                        homeport: 'Port Canaveral, FL' },
  'disney-treasure':  { regions: ['Caribbean'],                                        homeport: 'Port Canaveral, FL' },
  'disney-destiny':   { regions: ['Caribbean'],                                        homeport: 'Port Canaveral, FL' },
  'disney-adventure': { regions: ['Asia', 'Pacific Islands'],                          homeport: 'Singapore' },

  // HOLLAND AMERICA
  'ms-volendam':         { regions: ['Caribbean', 'South America'],                                homeport: 'Fort Lauderdale, FL' },
  'ms-zaandam':          { regions: ['Alaska', 'South America', 'Pacific Islands'],               homeport: 'Fort Lauderdale, FL' },
  'ms-zuiderdam':        { regions: ['Caribbean', 'Mediterranean'],                                homeport: 'Fort Lauderdale, FL' },
  'ms-oosterdam':        { regions: ['Alaska', 'Caribbean'],                                       homeport: 'Seattle, WA' },
  'ms-westerdam':        { regions: ['Alaska', 'Asia'],                                            homeport: 'Seattle, WA' },
  'ms-noordam':          { regions: ['Mediterranean', 'Caribbean', 'Northern Europe'],             homeport: 'Fort Lauderdale, FL' },
  'ms-eurodam':          { regions: ['Mediterranean', 'Caribbean'],                                homeport: 'Rotterdam, Netherlands' },
  'ms-nieuw-amsterdam':  { regions: ['Caribbean', 'Alaska'],                                       homeport: 'Fort Lauderdale, FL' },
  'ms-koningsdam':       { regions: ['Caribbean', 'Alaska', 'Mediterranean'],                      homeport: 'Fort Lauderdale, FL' },
  'ms-nieuw-statendam':  { regions: ['Caribbean', 'Alaska', 'Mediterranean'],                      homeport: 'Fort Lauderdale, FL' },
  'ms-rotterdam-vii':    { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'Transatlantic'], homeport: 'Rotterdam, Netherlands' },

  // MSC
  'msc-world-europa': { regions: ['Middle East', 'Mediterranean', 'Caribbean'],      homeport: 'Dubai, UAE' },
  'msc-seashore':     { regions: ['Mediterranean', 'Caribbean'],                      homeport: 'Genoa, Italy' },
  'msc-grandiosa':    { regions: ['Mediterranean', 'Northern Europe'],                homeport: 'Genoa, Italy' },
  'msc-virtuosa':     { regions: ['Northern Europe', 'Caribbean', 'Mediterranean'],   homeport: 'Southampton, UK' },
  'msc-meraviglia':   { regions: ['Caribbean', 'Mediterranean'],                      homeport: 'Miami, FL' },
  'msc-bellissima':   { regions: ['Asia', 'Mediterranean'],                           homeport: 'Shanghai, China' },
  'msc-seascape':     { regions: ['Caribbean'],                                        homeport: 'Miami, FL' },

  // NORWEGIAN
  'norwegian-prima':     { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],        homeport: 'Miami, FL' },
  'norwegian-encore':    { regions: ['Caribbean', 'Alaska'],                                  homeport: 'Miami, FL' },
  'norwegian-bliss':     { regions: ['Caribbean', 'Alaska', 'Transatlantic'],                 homeport: 'Miami, FL' },
  'norwegian-joy':       { regions: ['Caribbean', 'Alaska', 'Asia'],                          homeport: 'Miami, FL' },
  'norwegian-escape':    { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],          homeport: 'Miami, FL' },
  'norwegian-breakaway': { regions: ['Caribbean', 'North America', 'Mediterranean'],          homeport: 'New York, NY' },
  'norwegian-viva':      { regions: ['Caribbean', 'Mediterranean'],                           homeport: 'Miami, FL' },
  'norwegian-aqua':      { regions: ['Caribbean', 'Mediterranean'],                           homeport: 'Miami, FL' },
  'norwegian-getaway':   { regions: ['Caribbean', 'Transatlantic'],                           homeport: 'Miami, FL' },
  'norwegian-epic':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],          homeport: 'Miami, FL' },
  'norwegian-gem':       { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],        homeport: 'New York, NY' },
  'norwegian-pearl':     { regions: ['Caribbean', 'Alaska'],                                  homeport: 'Seattle, WA' },
  'norwegian-jade':      { regions: ['Mediterranean', 'Caribbean'],                           homeport: 'Athens (Piraeus), Greece' },
  'norwegian-jewel':     { regions: ['Caribbean', 'Alaska', 'South America'],                 homeport: 'Fort Lauderdale, FL' },
  'pride-of-america':    { regions: ['North America', 'Pacific Islands'],                      homeport: 'Honolulu, HI' },
  'norwegian-dawn':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],          homeport: 'Tampa, FL' },
  'norwegian-star':      { regions: ['Alaska', 'Caribbean', 'South America'],                 homeport: 'Seattle, WA' },
  'norwegian-sun':       { regions: ['Caribbean', 'South America'],                           homeport: 'Port Canaveral, FL' },
  'norwegian-sky':       { regions: ['Caribbean'],                                            homeport: 'Miami, FL' },
  'norwegian-spirit':    { regions: ['Asia', 'Caribbean', 'Indian Ocean'],                    homeport: 'Bangkok, Thailand' },
  'norwegian-luna':      { regions: ['Caribbean', 'Mediterranean'],                           homeport: 'Barcelona, Spain' },
  'norwegian-aura':      { regions: ['Caribbean', 'Mediterranean'],                           homeport: 'Miami, FL' },

  // P&O CRUISES
  'po-aurora':   { regions: ['Northern Europe', 'Mediterranean', 'South America', 'Transatlantic'],  homeport: 'Southampton, UK' },
  'po-arcadia':  { regions: ['Northern Europe', 'Mediterranean', 'South America', 'Indian Ocean'],   homeport: 'Southampton, UK' },
  'po-ventura':  { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],                       homeport: 'Southampton, UK' },
  'po-azura':    { regions: ['Caribbean', 'Mediterranean'],                                          homeport: 'Southampton, UK' },
  'po-britannia':{ regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],                       homeport: 'Southampton, UK' },
  'po-iona':     { regions: ['Northern Europe', 'Mediterranean', 'Caribbean'],                       homeport: 'Southampton, UK' },
  'po-arvia':    { regions: ['Caribbean', 'Mediterranean'],                                          homeport: 'Southampton, UK' },

  // PONANT
  'le-ponant':             { regions: ['Mediterranean', 'Caribbean', 'Indian Ocean'],                         homeport: 'Toulon, France' },
  'le-boreal':             { regions: ['Arctic & Antarctica', 'South America', 'Africa'],                     homeport: 'Ushuaia, Argentina' },
  'l-austral':             { regions: ['Arctic & Antarctica', 'South America', 'Africa'],                     homeport: 'Ushuaia, Argentina' },
  'le-soleal':             { regions: ['Arctic & Antarctica', 'Pacific Islands', 'Asia'],                     homeport: 'Papeete, French Polynesia' },
  'le-lyrial':             { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],                      homeport: 'Athens (Piraeus), Greece' },
  'le-laperouse':          { regions: ['Arctic & Antarctica', 'Africa', 'Indian Ocean'],                      homeport: 'Ushuaia, Argentina' },
  'le-champlain':          { regions: ['Caribbean', 'South America', 'Arctic & Antarctica'],                  homeport: 'Fort-de-France, Martinique' },
  'le-bougainville':       { regions: ['Pacific Islands', 'Asia', 'Indian Ocean'],                            homeport: 'Papeete, French Polynesia' },
  'le-dumont-d-urville':   { regions: ['Arctic & Antarctica', 'Australia & New Zealand', 'Pacific Islands'],  homeport: 'Ushuaia, Argentina' },
  'le-bellot':             { regions: ['Arctic & Antarctica', 'Northern Europe', 'Africa'],                   homeport: 'Longyearbyen, Norway' },
  'le-jacques-cartier':    { regions: ['Africa', 'Mediterranean', 'Northern Europe'],                         homeport: 'Marseille, France' },
  'le-commandant-charcot': { regions: ['Arctic & Antarctica', 'South America', 'Africa'],                     homeport: 'Ushuaia, Argentina' },

  // PRINCESS
  'grand-princess':     { regions: ['Caribbean', 'Mediterranean', 'Alaska'],                       homeport: 'Fort Lauderdale, FL' },
  'diamond-princess':   { regions: ['Asia', 'Australia & New Zealand'],                            homeport: 'Yokohama, Japan' },
  'sapphire-princess':  { regions: ['Alaska', 'Asia', 'Pacific Islands'],                          homeport: 'Seattle, WA' },
  'caribbean-princess': { regions: ['Caribbean', 'South America'],                                 homeport: 'Fort Lauderdale, FL' },
  'crown-princess':     { regions: ['Alaska', 'Caribbean', 'Mediterranean'],                       homeport: 'Seattle, WA' },
  'emerald-princess':   { regions: ['Alaska', 'Caribbean', 'Mediterranean'],                       homeport: 'Seattle, WA' },
  'ruby-princess':      { regions: ['Alaska', 'Pacific Islands'],                                  homeport: 'Seattle, WA' },
  'coral-princess':     { regions: ['Alaska', 'Caribbean', 'South America'],                       homeport: 'Fort Lauderdale, FL' },
  'island-princess':    { regions: ['Alaska', 'Caribbean', 'Pacific Islands'],                     homeport: 'Whittier, AK' },
  'royal-princess':     { regions: ['Caribbean', 'Alaska', 'North America'],                       homeport: 'Fort Lauderdale, FL' },
  'regal-princess':     { regions: ['Caribbean', 'Mediterranean'],                                 homeport: 'Fort Lauderdale, FL' },
  'majestic-princess':  { regions: ['Australia & New Zealand', 'Pacific Islands', 'Asia'],         homeport: 'Sydney, Australia' },
  'sky-princess':       { regions: ['Mediterranean', 'Caribbean', 'Northern Europe'],              homeport: 'Southampton, UK' },
  'enchanted-princess': { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],              homeport: 'Fort Lauderdale, FL' },
  'discovery-princess': { regions: ['Alaska', 'North America', 'Pacific Islands'],                 homeport: 'San Francisco, CA' },
  'sun-princess-2024':  { regions: ['Australia & New Zealand', 'Asia', 'Pacific Islands'],         homeport: 'Sydney, Australia' },
  'star-princess-2025': { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],                homeport: 'Fort Lauderdale, FL' },

  // REGENT
  'seven-seas-navigator': { regions: ['Caribbean', 'South America', 'Alaska', 'Pacific Islands'],               homeport: 'Miami, FL' },
  'seven-seas-mariner':   { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'Transatlantic'],        homeport: 'Barcelona, Spain' },
  'seven-seas-voyager':   { regions: ['Mediterranean', 'Northern Europe', 'Alaska', 'South America', 'Asia'],   homeport: 'Venice, Italy' },
  'seven-seas-explorer':  { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'Alaska', 'Transatlantic'], homeport: 'Barcelona, Spain' },
  'seven-seas-splendor':  { regions: ['Caribbean', 'Mediterranean', 'Northern Europe', 'Alaska', 'South America'], homeport: 'Miami, FL' },
  'seven-seas-grandeur':  { regions: ['Caribbean', 'Mediterranean', 'Northern Europe', 'Transatlantic'],        homeport: 'Miami, FL' },

  // RITZ-CARLTON
  'evrima':   { regions: ['Mediterranean', 'Caribbean', 'Northern Europe', 'Transatlantic'],        homeport: 'Lisbon, Portugal' },
  'ilma':     { regions: ['Mediterranean', 'Caribbean', 'Northern Europe', 'Transatlantic', 'Asia'], homeport: 'Barcelona, Spain' },
  'luminara': { regions: ['Mediterranean', 'Caribbean', 'Northern Europe', 'Transatlantic'],        homeport: 'Rome (Civitavecchia), Italy' },

  // SEABOURN
  'seabourn-sojourn':  { regions: ['Northern Europe', 'Mediterranean', 'Asia', 'Pacific Islands'],    homeport: 'Barcelona, Spain' },
  'seabourn-quest':    { regions: ['South America', 'Caribbean', 'Africa', 'Indian Ocean'],           homeport: 'Fort Lauderdale, FL' },
  'seabourn-encore':   { regions: ['Mediterranean', 'Asia', 'Australia & New Zealand', 'Indian Ocean'], homeport: 'Singapore' },
  'seabourn-ovation':  { regions: ['Mediterranean', 'Northern Europe', 'Asia', 'Australia & New Zealand'], homeport: 'Athens (Piraeus), Greece' },
  'seabourn-venture':  { regions: ['Arctic & Antarctica', 'Africa', 'Pacific Islands', 'South America'], homeport: 'Longyearbyen, Norway' },
  'seabourn-pursuit':  { regions: ['Arctic & Antarctica', 'Africa', 'Asia', 'Indian Ocean'],          homeport: 'Ushuaia, Argentina' },

  // SILVERSEA
  'silver-cloud':     { regions: ['Arctic & Antarctica', 'Africa', 'Indian Ocean'],                   homeport: 'Ushuaia, Argentina' },
  'silver-wind':      { regions: ['Arctic & Antarctica', 'Mediterranean', 'South America'],           homeport: 'Barcelona, Spain' },
  'silver-shadow':    { regions: ['Caribbean', 'Mediterranean', 'Asia'],                              homeport: 'Fort Lauderdale, FL' },
  'silver-whisper':   { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],                   homeport: 'Barcelona, Spain' },
  'silver-spirit':    { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'Asia'],           homeport: 'Barcelona, Spain' },
  'silver-muse':      { regions: ['Mediterranean', 'Caribbean', 'Northern Europe', 'South America'],  homeport: 'Fort Lauderdale, FL' },
  'silver-moon':      { regions: ['Mediterranean', 'Caribbean', 'Transatlantic'],                     homeport: 'Barcelona, Spain' },
  'silver-origin':    { regions: ['South America', 'Pacific Islands'],                                homeport: 'Guayaquil, Ecuador' },
  'silver-dawn':      { regions: ['Caribbean', 'Mediterranean', 'Northern Europe'],                   homeport: 'Fort Lauderdale, FL' },
  'silver-endeavour': { regions: ['Arctic & Antarctica', 'Africa', 'Pacific Islands'],                homeport: 'Ushuaia, Argentina' },
  'silver-nova':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic', 'Northern Europe'],  homeport: 'Fort Lauderdale, FL' },
  'silver-ray':       { regions: ['Mediterranean', 'Northern Europe', 'Caribbean', 'South America'],  homeport: 'Barcelona, Spain' },

  // VIKING
  'viking-star':     { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],             homeport: 'Bergen, Norway' },
  'viking-sea':      { regions: ['Mediterranean', 'Caribbean', 'Northern Europe'],             homeport: 'Bergen, Norway' },
  'viking-sky':      { regions: ['Northern Europe', 'Mediterranean', 'Arctic & Antarctica'],   homeport: 'Bergen, Norway' },
  'viking-yi-dun':   { regions: ['Asia', 'Pacific Islands'],                                   homeport: 'Shanghai, China' },
  'viking-orion':    { regions: ['Arctic & Antarctica', 'Australia & New Zealand', 'Asia'],    homeport: 'Sydney, Australia' },
  'viking-jupiter':  { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],             homeport: 'Bergen, Norway' },
  'viking-venus':    { regions: ['Asia', 'Pacific Islands', 'Australia & New Zealand'],        homeport: 'Osaka, Japan' },
  'viking-mars':     { regions: ['Mediterranean', 'Caribbean', 'Transatlantic'],               homeport: 'Bergen, Norway' },
  'viking-neptune':  { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],             homeport: 'Bergen, Norway' },
  'viking-saturn':   { regions: ['Mediterranean', 'Northern Europe', 'Africa'],                homeport: 'Bergen, Norway' },
  'viking-vela':     { regions: ['Mediterranean', 'Caribbean', 'Transatlantic'],               homeport: 'Bergen, Norway' },
  'viking-vesta':    { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],             homeport: 'Bergen, Norway' },
  'viking-octantis': { regions: ['Arctic & Antarctica', 'North America', 'Pacific Islands'],   homeport: 'Toronto, Canada' },
  'viking-polaris':  { regions: ['Arctic & Antarctica', 'Africa', 'South America'],            homeport: 'Longyearbyen, Norway' },
  'viking-mira':     { regions: ['Mediterranean', 'Northern Europe', 'Caribbean'],             homeport: 'Bergen, Norway' },
  'viking-libra':    { regions: ['Mediterranean', 'Caribbean', 'Northern Europe'],             homeport: 'Bergen, Norway' },
  'viking-astrea':   { regions: ['Mediterranean', 'Northern Europe', 'Transatlantic'],         homeport: 'Bergen, Norway' },
  'viking-lyra':     { regions: ['Asia', 'Pacific Islands', 'Australia & New Zealand'],        homeport: 'Singapore' },

  // ROYAL CARIBBEAN
  'wonder-of-the-seas':       { regions: ['Caribbean', 'Mediterranean'],                              homeport: 'Port Canaveral, FL' },
  'icon-of-the-seas':         { regions: ['Caribbean'],                                               homeport: 'Miami, FL' },
  'symphony-of-the-seas':     { regions: ['Caribbean', 'Mediterranean'],                              homeport: 'Miami, FL' },
  'harmony-of-the-seas':      { regions: ['Caribbean', 'Mediterranean'],                              homeport: 'Port Canaveral, FL' },
  'allure-of-the-seas':       { regions: ['Caribbean', 'Mediterranean'],                              homeport: 'Port Canaveral, FL' },
  'oasis-of-the-seas':        { regions: ['Caribbean', 'Mediterranean'],                              homeport: 'Port Canaveral, FL' },
  'quantum-of-the-seas':      { regions: ['Asia', 'Australia & New Zealand'],                         homeport: 'Singapore' },
  'anthem-of-the-seas':       { regions: ['Caribbean', 'Transatlantic', 'Northern Europe'],           homeport: 'Southampton, UK' },
  'utopia-of-the-seas':       { regions: ['Caribbean'],                                               homeport: 'Port Canaveral, FL' },
  'star-of-the-seas':         { regions: ['Caribbean'],                                               homeport: 'Port Canaveral, FL' },
  'ovation-of-the-seas':      { regions: ['Alaska', 'Australia & New Zealand', 'Asia'],               homeport: 'Seattle, WA' },
  'spectrum-of-the-seas':     { regions: ['Asia', 'Pacific Islands'],                                 homeport: 'Shanghai, China' },
  'odyssey-of-the-seas':      { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],             homeport: 'Fort Lauderdale, FL' },
  'freedom-of-the-seas':      { regions: ['Caribbean'],                                               homeport: 'Port Canaveral, FL' },
  'liberty-of-the-seas':      { regions: ['Caribbean', 'Transatlantic'],                              homeport: 'Miami, FL' },
  'independence-of-the-seas': { regions: ['Caribbean', 'Northern Europe', 'Mediterranean'],           homeport: 'Southampton, UK' },
  'voyager-of-the-seas':      { regions: ['Australia & New Zealand', 'Pacific Islands', 'Caribbean'], homeport: 'Brisbane, Australia' },
  'explorer-of-the-seas':     { regions: ['Caribbean', 'Transatlantic'],                              homeport: 'Cape Liberty (Bayonne), NJ' },
  'adventure-of-the-seas':    { regions: ['Caribbean'],                                               homeport: 'Port Canaveral, FL' },
  'navigator-of-the-seas':    { regions: ['Caribbean', 'Pacific Islands'],                            homeport: 'Los Angeles, CA' },
  'mariner-of-the-seas':      { regions: ['Caribbean'],                                               homeport: 'Port Canaveral, FL' },
  'radiance-of-the-seas':     { regions: ['Alaska', 'Caribbean', 'South America'],                    homeport: 'Vancouver, Canada' },
  'brilliance-of-the-seas':   { regions: ['Mediterranean', 'Transatlantic', 'Caribbean'],             homeport: 'Tampa, FL' },
  'serenade-of-the-seas':     { regions: ['Caribbean', 'Alaska', 'South America'],                    homeport: 'Tampa, FL' },
  'jewel-of-the-seas':        { regions: ['Caribbean', 'Transatlantic', 'Northern Europe'],           homeport: 'Tampa, FL' },
  'vision-of-the-seas':       { regions: ['Mediterranean', 'Caribbean', 'Middle East'],               homeport: 'Athens (Piraeus), Greece' },
  'enchantment-of-the-seas':  { regions: ['Caribbean', 'North America'],                              homeport: 'Baltimore, MD' },

  // WINDSTAR
  'wind-star':    { regions: ['Mediterranean', 'Caribbean', 'Northern Europe'],         homeport: 'Athens (Piraeus), Greece' },
  'wind-spirit':  { regions: ['Pacific Islands', 'Mediterranean'],                      homeport: 'Papeete, French Polynesia' },
  'wind-surf':    { regions: ['Caribbean', 'Mediterranean', 'Transatlantic'],           homeport: 'Bridgetown, Barbados' },
  'star-breeze':  { regions: ['Mediterranean', 'Northern Europe', 'Africa'],            homeport: 'Lisbon, Portugal' },
  'star-legend':  { regions: ['Northern Europe', 'Mediterranean', 'Arctic & Antarctica'], homeport: 'Bergen, Norway' },
  'star-pride':   { regions: ['Caribbean', 'South America', 'North America'],           homeport: 'Bridgetown, Barbados' },
  'star-seeker':  { regions: ['Caribbean', 'Alaska', 'Asia', 'Pacific Islands'],        homeport: 'Miami, FL' },
  'star-explorer':{ regions: ['Mediterranean', 'Caribbean', 'Asia', 'Arctic & Antarctica'], homeport: 'Barcelona, Spain' },
};

const files = [
  'azamara.json', 'carnival.json', 'celebrity.json', 'costa.json',
  'crystal.json', 'cunard.json', 'disney.json', 'holland-america.json',
  'msc.json', 'norwegian.json', 'po-cruises.json', 'ponant.json',
  'princess.json', 'regent.json', 'ritz-carlton.json', 'royal-caribbean.json',
  'seabourn.json', 'silversea.json', 'viking.json', 'windstar.json',
];

let totalUpdated = 0;
let totalMissing = [];

for (const file of files) {
  const filePath = path.join(shipsDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const ships = JSON.parse(raw);

  for (const ship of ships) {
    const id = ship.id;
    const meta = shipMeta[id];
    if (!meta) {
      totalMissing.push(`${file}: ${id}`);
      continue;
    }
    ship.regions = meta.regions;
    ship.homeport = meta.homeport;
    totalUpdated++;
  }

  fs.writeFileSync(filePath, JSON.stringify(ships, null, 2) + '\n', 'utf8');
  console.log(`✓ ${file} (${ships.length} ships)`);
}

console.log(`\nDone. Updated ${totalUpdated} ships.`);
if (totalMissing.length > 0) {
  console.log(`\nMissing metadata for:\n  ${totalMissing.join('\n  ')}`);
}
