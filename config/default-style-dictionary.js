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
        generateAndroidGraphics: require('../actions/android/vector'),
        generateWebGraphics: require('../actions/generateWebGraphics'),
    },
    // custom transforms
    transform: {
        'attribute/cti': require('../transforms/attributeCTI'),
    },
    // custom formats
    format: {
        swiftColor: require('../formats/swiftColor'),
        swiftImage: require('../formats/swiftImage'),
    },
});

// Dark Mode
// we will only build the files we need to, we don't need to rebuild all the files
module.exports = (brand) => {
    return styleDictionary.extend({
        source: [
            `tokens/brands/${brand}/**/!(*.dark).js`
        ],

        platforms: {
            css: {
                transformGroup: `css`,
                buildPath: webPath,
                actions: [`generateWebGraphics`],
                files: [{
                    destination: `variables.css`,
                    format: `css/variables`,
                    options: {
                        outputReferences: true
                    }
                }]
            },

            js: {
                transformGroup: `web`,
                buildPath: webPath,
                files: [{
                    destination: `tokens.json`,
                    format: `json/flat`
                }]
            },

            ios: {
                buildPath: iosPath,
                transforms: [`attribute/cti`, `name/ti/camel`, `color/UIColorSwift`, `size/swift/remToCGFloat`],
                actions: [`generateColorsets`],
                files: [{
                    destination: `Color.swift`,
                    format: `swiftColor`,
                    filter: (token) => token.attributes.category === `color`,
                    options: {
                        outputReferences: true
                    }
                }, {
                    destination: `Size.swift`,
                    filter: (token) => token.attributes.category === `size`,
                    className: `Size`,
                    format: `ios-swift/class.swift`
                }, {
                    destination: `Image.swift`,
                    filter: (token) => token.attributes.category === `image`,
                    format: `swiftImage`
                }]
            },

            iosAssets: {
                transforms: [`attribute/cti`, `color/hex`, `size/remToPx`, `name/ti/camel`],
                actions: [`generateIosGraphics`],
                buildPath: `${iosPath}/images/`,
                path: iosPath,
                mode: `light`
            },

            android: {
                transformGroup: `android`,
                buildPath: androidPath,
                files: [{
                    destination: `values/colors.xml`,
                    format: `android/resources`,
                    filter: (token) => token.attributes.category === `color`,
                    options: {
                        outputReferences: true
                    },
                }, {
                    destination: `values/font_dimens.xml`,
                    filter: (token) => token.attributes.category === `size` &&
                        token.attributes.type === `font`,
                    format: `android/resources`
                }, {
                    destination: `values/dimens.xml`,
                    filter: (token) => token.attributes.category === `size` &&
                        token.attributes.type !== `font`,
                    format: `android/resources`
                }]
            },

            androidAssets: {
                transforms: [`attribute/cti`, `color/hex`, `size/remToPx`, `name/ti/camel`],
                actions: [`generateAndroidGraphics`],
                buildPath: `${androidPath}/images/`,
                path: androidPath,
                mode: `light`
            }
        }
    });
}
