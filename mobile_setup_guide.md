# Mobile Packaging & Deployment Guide (iOS & Android)

This guide walks you through compiling your local web code into native mobile applications for the **Apple App Store** and **Google Play Store** using **Capacitor**.

---

## 1. Prerequisites

Before building, make sure you have the following installed on your developer machine:

*   **Node.js & npm**: [nodejs.org](https://nodejs.org)
*   **For Apple iOS (App Store)**:
    *   A macOS computer.
    *   **Xcode**: Install from the Mac App Store.
    *   **CocoaPods**: Run `sudo gem install cocoapods` in the Mac terminal.
    *   An Apple Developer Account (required for code signing and App Store submission).
*   **For Google Play (Android)**:
    *   **Android Studio**: [developer.android.com/studio](https://developer.android.com/studio)
    *   Android SDK Platform tools.

---

## 2. Setting Up Capacitor in the Project

Open a terminal or command prompt inside your project folder (`healthcare-optimizer`) and follow these commands:

### Step A: Install Dependencies
Download Capacitor core, the mobile CLI, and the native biometric plugins:
```bash
npm install
```

### Step B: Sync and Build Native Platforms
Generate the native iOS and Android project wrappers:
```bash
# Add iOS Platform files
npm run cap:add-ios

# Add Android Platform files
npm run cap:add-android
```
*Note: This creates two new native directories in your folder: `/ios` (an Xcode project) and `/android` (an Android Studio project).*

### Step C: Copy Web Code to Native Projects
Whenever you make changes to your HTML, CSS, or JS code, you must sync them to your mobile app builds:
```bash
npm run cap:sync
```

---

## 3. Opening & Compiling Native Projects

### A. For Apple iOS (App Store)
Open your native workspace in Xcode:
```bash
npm run cap:open-ios
```
1.  **Select Target**: In Xcode, select your app target and choose a simulator (e.g., iPhone 15 Pro) or plug in your real iPhone.
2.  **Add Biometric Usage Strings**: 
    Open `ios/App/App/Info.plist` in Xcode and add the key **Privacy - Face ID Usage Description** (`NSFaceIDUsageDescription`) with a descriptive value (e.g., *"This app requires Face ID to secure your medical financial data"*). This is required by Apple, otherwise the app will crash upon prompting.
3.  **Sign App**: Under *Signing & Capabilities*, select your Apple Developer Team and resolve the signing certificate.
4.  **Run**: Click the Play button in Xcode to compile and launch.
5.  **Publish**: Change target to *Any iOS Device (arm64)*, go to *Product -> Archive*, and click *Distribute App* to upload to App Store Connect/TestFlight.

### B. For Android (Google Play)
Open your native workspace in Android Studio:
```bash
npm run cap:open-android
```
1.  **Sync Gradle**: Allow Android Studio to download gradle dependencies.
2.  **Add Biometric Permission**:
    Open `android/app/src/main/AndroidManifest.xml` and ensure the biometric permission is listed inside the `<manifest>` tag:
    ```xml
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    ```
3.  **Run**: Run on an Android emulator or connected device.
4.  **Publish**: Go to *Build -> Generate Signed Bundle / APK*, select *Android App Bundle (AAB)*, sign it with your keystore, and upload it to the Google Play Console.

---

## 4. Local Privacy & Offline Storage Architecture

*   **100% Client-Side Sandboxing**: When running on mobile, Capacitor runs your HTML/JS inside a native container called `WKWebView` (on iOS) or `WebView` (on Android).
*   **Security & Encryption**: Browser `localStorage` is fully sandboxed on iOS/Android. Native biometrics act as an authentication layer before the user profile can be read from memory.
*   **External Calls**: The app remains fully offline. The only network call made is a direct query from your phone's webview to `api.healthcare.gov` only if you supply your CMS API key.
