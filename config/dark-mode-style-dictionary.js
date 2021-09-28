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
        'colorRGB': require('./transforms/colorRGB'),
        'size/remToFloat': require('./transforms/remToFloat')
    },
    // custom formats
    format: {
        swiftColor: require('./formats/swiftColor'),
        swiftImage: require('./formats/swiftImage'),
    },
});

// @todo, probably don't want to swap rem to float for web assets? E.g. stroke of an svg
const assets = {
    transforms: [`attribute/cti`, `color/hex`, `size/remToFloat`, `name/ti/camel`],
    buildPath: `${webPath}/images/`,
    iosPath,
    androidPath,
    actions: [`generateGraphics`]
};


const iosColors = {
    buildPath: iosPath,
    transforms: [`attribute/cti`, `colorRGB`, `name/ti/camel`],
    actions: [`generateColorsets`]
};

module.exports = styleDictionary.extend({
    include: [
        `tokens/**/!(*.dark).js`
    ],
    source: [
        `tokens/**/*.dark.js`
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

        iosColors: Object.assign(iosColors, {
            mode: `dark`
        }),

        assets: Object.assign(assets, {
            mode: `dark`
        }),

        android: {
            transformGroup: `android`,
            buildPath: androidPath,
            files: [{
                destination: `values-night/colors.xml`,
                format: `android/resources`,
                // only outputting the tokens from files with '.dark' in the filepath
                filter: (token) => token.filePath.indexOf(`.dark`) > -1
            }]
        }
    }
});
