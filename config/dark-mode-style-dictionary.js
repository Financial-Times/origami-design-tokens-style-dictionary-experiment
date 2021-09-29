const StyleDictionary = require('style-dictionary');
const fs = require('fs-extra');

const buildPath = 'dist/'
const webPath = `${buildPath}/web/`
const iosPath = `${buildPath}/ios/`
const androidPath = `${buildPath}/android/styledictionary/src/main/res/`;

console.log(`removing previous build...`);
fs.removeSync(buildPath);

// Adding custom actions, transforms, and formats
const styleDictionary = StyleDictionary.extend({
    // custom actions
    action: {
        generateColorsets: require('../actions/ios/colorsets.js'),
        generateIosGraphics: require('../actions/ios/imagesets'),
        generateAndroidGraphics: require('../actions/android/vector')
    },
    // custom transforms
    transform: {
        'attribute/cti': require('../transforms/attributeCTI')
    },
});


module.exports = (brand) => {
    return styleDictionary.extend({
        include: [
            `tokens/brands/${brand}/**/!(*.dark).js`
        ],
        source: [
            `tokens/brands/${brand}/**/*.dark.js`
        ],
        platforms: {
            css: {
                transformGroup: `css`,
                buildPath: webPath,
                files: [{
                    destination: `variables-dark.css`,
                    format: `css/variables`,
                    // only putting in the tokens from files with '.dark' in the filepath
                    filter: (token) => token.filePath.indexOf(`.dark`) > -1,
                    options: {
                        outputReferences: true
                    }
                }]
            },

            ios: {
                buildPath: iosPath,
                transforms: [`attribute/cti`, `name/ti/camel`, `color/UIColorSwift`, `size/swift/remToCGFloat`],
                actions: [`generateColorsets`]
            },

            iosAssets: {
                transforms: [`attribute/cti`, `color/hex`, `size/remToPx`, `name/ti/camel`],
                actions: [`generateIosGraphics`],
                buildPath: `${webPath}/images/`,
                path: iosPath,
                mode: `dark`
            },

            android: {
                transformGroup: `android`,
                buildPath: androidPath,
                files: [{
                    destination: `values-night/colors.xml`,
                    format: `android/resources`,
                    // only outputting the tokens from files with '.dark' in the filepath
                    filter: (token) => token.filePath.indexOf(`.dark`) > -1
                }]
            },

            androidAssets: {
                transforms: [`attribute/cti`, `color/hex`, `size/remToPx`, `name/ti/camel`],
                actions: [`generateAndroidGraphics`],
                buildPath: `${webPath}/images/`,
                path: androidPath,
                mode: `dark`
            }
        }
    })
};
