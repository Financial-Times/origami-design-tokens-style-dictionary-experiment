const defaultStyleDictionary = require('./config/default-style-dictionary');
const darkModeStyleDictionary = require('./config/dark-mode-style-dictionary');


console.log(`☀️ Building light mode...`);
defaultStyleDictionary('core').buildAllPlatforms();

console.log(`\n\n🌙 Building dark mode...`);
darkModeStyleDictionary('core').buildAllPlatforms();

