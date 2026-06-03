const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Platform-specific module resolution for web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle stripe-react-native on web
  if (platform === 'web' && moduleName === '@stripe/stripe-react-native') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('./src/services/StripeWrapper.web.tsx'),
    };
  }

  // Let Metro's default resolution handle .web.ts/.web.tsx files
  // Metro will automatically look for .web.ts/.web.tsx when resolving modules on web platform
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
