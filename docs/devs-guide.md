# ClutterHuck Dev Setup & Testing Guide

### (For Local Development with Expo Go on Android & iOS)

This guide explains how to set up, install dependencies, and test the app locally without consuming limited Expo cloud builds.

---

## 1. Prerequisites

Each dev should install the following:

* **Node.js (LTS version)** 
* **GitHub Desktop** 
* **npm** (comes with Node) or **yarn** (optional)
* **Expo Go app** → install from App Store (iOS) / Play Store (Android)
* **Expo CLI** →

  ```bash
  npm install -g expo-cli
  ```

Optional (for simulator/emulator testing):

* **Android Studio** → includes Android emulator
* **Xcode (macOS only)** → for iOS simulator

---

## 2. Project Setup

1. Clone the repo using Github Desktop

2. Install dependencies:

   ```bash
   npm install
   ```

   (or `yarn install` if using Yarn)

3. Make sure `.env` file (with Supabase keys, etc.) is copied/shared securely. NOTE: ASK CARLOS FOR THIS.

   * Example `.env.local`:

     ```
     EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

---

## 3. Running the App

To run without consuming build credits, always use **Expo Go** or a local simulator:

### Android (device or emulator)

```bash
npx expo start --android
```

* Opens Metro bundler in terminal/browser.
* Scan QR code with **Expo Go** app (on device).
* Or launch in Android Studio Emulator.

### iOS (device or simulator, Mac only)

```bash
npx expo start --ios
```

* Opens the iOS simulator (if installed).
* Or scan QR code with **Expo Go** on iPhone.

### Generic start

```bash
npx expo start
```

* Shows a QR code.
* Scan with Expo Go app (works for both Android and iOS).

---

## 4. Development Workflow

* Make code changes → press **r** in Metro bundler to reload.
* Use **Hot Reload** to instantly see updates.
* Commit & push changes via Git regularly.
* Do **not** run `eas build` unless explicitly needed for production/testflight/Play Store.

---

## 5. Things to Avoid (to save credits)

❌ Don’t run:

* `eas build --platform ios`
* `eas build --platform android`

❌ Don’t generate dev clients unless necessary.

* Always stick to **Expo Go** for development builds.

---

## 6. Notes

* Expo Go has some limitations (e.g. no custom native modules), but all current features (Supabase auth, storage, navigation, etc.) work fine.
* If we ever add native dependencies that **Expo Go** doesn’t support, we’ll switch to **dev client** builds, but only then.
* Each dev can work/test independently without using up the Expo subscription’s build quota.

---

## 7. Troubleshooting

* If `npm install` fails, delete `node_modules` and run `npm install` again.
* If QR code doesn’t load, ensure phone and computer are on the **same Wi-Fi**.
* For iOS devs → you need macOS + Xcode to use the iOS simulator. Otherwise, just test on Expo Go iPhone app.

---

END
