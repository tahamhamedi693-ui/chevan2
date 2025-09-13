const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude @stripe/stripe-react-native from web builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Block native-only packages from web builds
config.resolver.blockList = [
  // Block @stripe/stripe-react-native on web
  /.*\/node_modules\/@stripe\/stripe-react-native\/.*\.js$/,
];

// Platform-specific extensions priority
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;