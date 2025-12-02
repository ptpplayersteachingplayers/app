# PTP Soccer - Mobile App

**Repository:** https://github.com/studentcodinghub/ptpsoccer-mobileapp

A production-ready **Expo (React Native)** mobile application for **Players Teaching Players (PTP) Soccer Camps**, built on top of an existing WordPress backend.

## Overview

PTP Soccer allows parents to:
- Browse and register for summer camps and winter clinics
- Find and connect with private trainers (NCAA & pro players)
- View their child's upcoming schedule
- Receive push notifications for reminders

## Tech Stack

### Mobile App
- **Expo SDK 52** (React Native 0.76.5)
- **TypeScript** - Full type safety throughout
- **React Navigation 6** - Stack + Bottom Tabs
- **Axios** - HTTP client with interceptors
- **expo-secure-store** - Secure JWT token storage

### Backend
- **WordPress** + **WooCommerce** (existing site)
- **JWT Authentication for WP REST API** (plugin)
- **PTP Mobile API** (custom plugin included)

## Project Structure

```
├── App.tsx                    # Entry point
├── src/
│   ├── api/
│   │   └── client.ts          # Axios client with auth interceptors
│   ├── components/
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── PrimaryButton.tsx
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication state management
│   ├── navigation/
│   │   └── index.tsx          # Navigation configuration
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── CampsScreen.tsx
│   │   ├── CampDetailScreen.tsx
│   │   ├── TrainersScreen.tsx
│   │   ├── TrainerDetailScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── theme/
│   │   └── index.ts           # PTP brand colors and tokens
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── utils/
│       └── notifications.ts   # Push notification helpers
└── wordpress-plugin/
    └── ptp-mobile-api/
        ├── ptp-mobile-api.php # WordPress REST API plugin
        └── uninstall.php
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ptp-mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Troubleshooting: TurboModule / PlatformConstants Errors

If you see errors like:
- `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found`
- `Invariant Violation: TurboModuleRegistry.getEnforcing`

**This is a version mismatch between your project and Expo Go.** Fix it with these steps:

#### Step 1: Delete node_modules and lock file
```bash
rm -rf node_modules
rm package-lock.json
# or if using yarn:
rm yarn.lock
```

#### Step 2: Reinstall dependencies
```bash
npm install
```

#### Step 3: Fix Expo dependency versions automatically
```bash
npx expo install --fix
```

#### Step 4: Clear all caches and restart
```bash
npx expo start -c
```

#### Step 5: Update Expo Go app
Make sure your Expo Go app on your phone is updated to the latest version from the App Store/Play Store.

#### Still having issues?

If the error persists:

1. **Check SDK version alignment:**
   - This project uses **Expo SDK 52**
   - Ensure `app.json` has `"sdkVersion": "52.0.0"`
   - Ensure `package.json` has `"expo": "~52.0.0"`

2. **Verify compatible versions:**
   ```json
   {
     "expo": "~52.0.0",
     "react": "18.3.1",
     "react-native": "0.76.5",
     "expo-constants": "~17.0.3",
     "expo-secure-store": "~14.0.1",
     "expo-status-bar": "~2.0.1"
   }
   ```

3. **Create a fresh Expo project and compare:**
   ```bash
   npx create-expo-app@latest test-app
   ```
   Compare the versions in the new project's package.json with yours.

### WordPress Setup

1. Upload the `wordpress-plugin/ptp-mobile-api` folder to `/wp-content/plugins/`
2. Activate "PTP Mobile API" in WordPress admin
3. Ensure "JWT Authentication for WP REST API" plugin is installed and configured

## Brand Guidelines

### Colors
- **PTP Yellow** (Primary): `#FCB900`
- **Ink Black** (Text): `#0E0F11`
- **Off-White** (Background): `#F4F3F0`
- **Gray** (Secondary text): `#6B7280`
- **Border**: `#E5E7EB`

### UI Style
- Clean, modern, sports-brand feel
- High contrast (yellow on black, black on off-white)
- Rounded corners (~16px radius)
- Generous spacing

## API Endpoints

The PTP Mobile API plugin provides these endpoints:

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/wp-json/jwt-auth/v1/token` | No | Get JWT token |
| GET | `/wp-json/ptp/v1/me` | Yes | Current user info |
| GET | `/wp-json/ptp/v1/camps` | No | List camps & clinics |
| GET | `/wp-json/ptp/v1/trainers` | No | List trainers |
| GET | `/wp-json/ptp/v1/sessions` | Yes | User's schedule |
| POST | `/wp-json/ptp/v1/devices` | Yes | Register push token |

## NPM Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npm run start:clear

# Auto-fix Expo dependency versions
npm run fix-deps

# Type checking
npm run type-check

# Linting
npm run lint
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

Proprietary - Players Teaching Players

## Support

For questions or issues, contact info@ptpsummercamps.com
