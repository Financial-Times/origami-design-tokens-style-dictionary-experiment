const defaultStyleDictionary = require('./config/default-style-dictionary');
const darkModeStyleDictionary = require('./config/dark-mode-style-dictionary');


console.log(`☀️ Building light mode...`);
defaultStyleDictionary.buildAllPlatforms();

console.log(`\n\n🌙 Building dark mode...`);
darkModeStyleDictionary.buildAllPlatforms();

