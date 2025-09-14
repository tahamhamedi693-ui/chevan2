# Building APK for RideShare App

This guide will help you build an APK file for the RideShare app.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI** and **EAS CLI** installed globally
3. **Expo account** (free)

## Setup Instructions

### Step 1: Install Required Tools

Open PowerShell or Command Prompt and run:

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Install EAS CLI globally
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
# Login to your Expo account
eas login
```

If you don't have an Expo account, create one at https://expo.dev/

### Step 3: Configure Your Project

The project is already configured with:
- `eas.json` - EAS Build configuration
- `app.json` - App configuration with package name `com.rideshare.app`

## Building the APK

### Option 1: Build APK using EAS Build (Recommended - Cloud Build)

This builds your app on Expo's servers:

```bash
# Navigate to project directory
cd "c:\Users\HP\Desktop\New folder (10)\project"

# Configure the project for EAS Build (first time only)
eas build:configure

# Build APK for Android (Preview/Testing)
npm run build:android:preview

# OR Build APK for Production
npm run build:android:production
```

The build will:
1. Upload your code to Expo servers
2. Build the APK in the cloud
3. Provide a download link when complete (usually takes 10-20 minutes)

### Option 2: Local Build (Requires Android Studio)

If you have Android Studio and Android SDK installed:

```bash
# Build locally (requires Android development environment)
npm run build:android:local
```

### Option 3: Expo Development Build

For testing on your device with Expo Go:

```bash
# Start the development server
npm start

# Then:
# 1. Install Expo Go app on your Android device
# 2. Scan the QR code shown in terminal
```

## After Building

### Installing the APK

1. **Download the APK** from the link provided by EAS Build
2. **Transfer to your Android device** via:
   - Email
   - Google Drive
   - USB cable
   - Direct download on device

3. **Enable "Install from Unknown Sources"** on your Android device:
   - Go to Settings → Security
   - Enable "Unknown sources" or "Install unknown apps"

4. **Install the APK** by tapping on the downloaded file

## Build Configuration

The app is configured with:
- **Package name**: `com.rideshare.app`
- **Version**: 1.0.0
- **Minimum Android SDK**: 21 (Android 5.0)
- **Permissions**: Location access for ride tracking

## Troubleshooting

### Common Issues:

1. **"eas: command not found"**
   - Solution: Install EAS CLI: `npm install -g eas-cli`

2. **"You must be logged in"**
   - Solution: Run `eas login`

3. **Build fails with "Invalid configuration"**
   - Solution: Ensure all environment variables in app.json are set correctly

4. **APK won't install**
   - Solution: Enable "Unknown sources" in Android settings
   - Make sure no previous version is installed

## Environment Variables

Before building for production, update these in `app.json`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_URL`

## Build Profiles

- **development**: Debug build with development client
- **preview**: Internal testing APK
- **production**: Production-ready APK for distribution

## Next Steps

After successful build:
1. Test the APK thoroughly on multiple devices
2. Consider setting up app signing for Google Play Store
3. Prepare store listings and screenshots
4. Submit to Google Play Store (requires Google Play Console account)

## Support

For issues with:
- **Expo/EAS Build**: https://docs.expo.dev/build/introduction/
- **Android-specific issues**: Check Android Studio logs
- **App crashes**: Use `adb logcat` for debugging
