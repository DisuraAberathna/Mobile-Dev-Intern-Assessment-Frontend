# Frontend - Course App Mobile

React Native (Expo) frontend for the Course App Mobile Dev Intern Assessment.

## Tech Stack

- React Native
- Expo SDK 54
- Expo Router
- Axios
- FlashList

## Prerequisites

- Node.js 18+
- Expo Go app or Android/iOS emulator
- Running backend API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000
```

Use your machine's local IP so physical devices can reach the backend.

3. Start the Expo server:

```bash
npm start
```

4. Run app:

- Scan the QR code with Expo Go (Android) or Camera app (iOS), or
- Run on simulator/emulator with platform scripts below.

## Available Scripts

- `npm start` - Start Expo
- `npm run android` - Launch Android target
- `npm run ios` - Launch iOS target
- `npm run web` - Launch web target
- `npm run lint` - Run lint checks
