import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: IS_DEV ? 'shoogy-expo' : 'Shoogy',
  slug: 'shoogy-expo',
  version: '1.0.0',
  scheme: 'shoogy',
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        android: {
          kotlinVersion: '1.6.10',
          packagingOptions: {
            pickFirst: ['**/libc++_shared.so'],
          },
          newArchEnabled: true,
          windowSoftInputMode: 'adjustResize',
        },
        ios: {
          newArchEnabled: true,
        },
      },
    ],
    'expo-font',
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? 'com.yuriipolishchuk.shoogy.expo_dev' : 'com.yuriipolishchuk.shoogy',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: IS_DEV ? 'com.yuriipolishchuk.shoogy.expo_dev' : 'com.yuriipolishchuk.shoogy',
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '71d32c55-452e-4901-b18f-9b15442818ad',
    },
  },
});
