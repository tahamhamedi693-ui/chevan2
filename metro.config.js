const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude @stripe/stripe-react-native from web builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Alias native modules to web-compatible wrappers
config.resolver.extraNodeModules = {
  '@stripe/stripe-react-native': path.resolve(__dirname, 'components/StripeProviderWrapper.web.tsx'),
};

// Platform-specific extensions priority
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;