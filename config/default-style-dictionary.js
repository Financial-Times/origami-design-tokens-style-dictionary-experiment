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
        generateGraphics: require('../actions/generateGraphics'),
        generateWebGraphics: require('../actions/generateWebGraphics'),
    },
    // custom transforms
    transform: {
        'attribute/cti': require('./transforms/attributeCTI'),
    },
    // custom formats
    format: {
        swiftColor: require('./formats/swiftColor'),
        swiftImage: require('./formats/swiftImage'),
    },
});

// @todo, probably don't want to swap rem to float for web assets? E.g. stroke of an svg
// @todo split the assets action for ios, android, web
const assets = {
    transforms: [`attribute/cti`, `color/hex`, `size/remToFloat`, `name/ti/camel`],
    buildPath: `${webPath}/images/`,
    iosPath,
    androidPath,
    actions: [`generateGraphics`]
};

// Dark Mode
// we will only build the files we need to, we don't need to rebuild all the files
module.exports = styleDictionary.extend({
    source: [
        `tokens/**/!(*.dark).js`
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

        iOS: {
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

        assets: Object.assign(assets, {
            mode: `light`
        }),
    }
});
