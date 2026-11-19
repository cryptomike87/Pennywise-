# Pennywise Android port

Pennywise is a personal Android-focused derivative of [Actual Budget](https://github.com/actualbudget/actual).

## Current approach

The upstream project already includes a Capacitor-based mobile client and Android Gradle project. This port keeps the existing React budgeting application and uses Capacitor to package it as an Android application.

## Android identity

- Display name: Pennywise
- Android application ID: `com.cryptomike87.pennywise`
- Native source namespace: `org.actualbudget` (kept unchanged to avoid unnecessary native source moves)
- Mobile project: `packages/mobile-client`

## Build a debug APK

Requirements:
- Node.js 22.18 or newer
- Corepack and Yarn 4
- Java 21
- Android SDK / Gradle dependencies

From the repository root:

```bash
corepack enable
yarn install --immutable
yarn build:browser --mobile
yarn workspace mobile-client build:android
```

The APK is copied to:

```
packages/mobile-client/build/app-debug.apk
```

## GitHub Actions

The workflow `.github/workflows/pennywise-android.yml` builds the debug APK when code is pushed to an `android/*` branch, or when manually started from the Actions tab. The APK is uploaded as a workflow artifact for 14 days.

## Planned Android work

1. Confirm clean build and install on a physical Android device.
2. Verify local database persistence and offline transaction entry.
3. Add native biometric unlock using Android BiometricPrompt.
4. Improve Android navigation, edge-to-edge layout, and back-button behavior.
5. Add native notifications and sharing where they improve the budgeting workflow.
6. Establish a signed release build after choosing a secure signing process.

## Upstream and licensing

This repository is based on Actual Budget and retains its upstream license and notices. See the repository's MIT license and upstream attribution. Keep upstream notices intact when distributing builds.
