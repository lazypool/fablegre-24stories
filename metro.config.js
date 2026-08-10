const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('md', 'words');

module.exports = withNativeWind(config, { input: './global.css' });
