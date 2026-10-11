# loomdesign — Native Android app

This is a standalone native Android application built with Kotlin and Jetpack Compose. It does not wrap the Electron desktop renderer.

## Current capabilities

- Chat-first mobile layout with large touch targets and a simple bottom navigation bar.
- Starter prompts for UI design, code explanation, and project planning.
- OpenAI-compatible chat completion API connection configured in Settings (HTTPS required).
- API key is held in app memory only; it is not written to preferences or files.
- Clear loading and request-error states, plus dedicated 404 and 402 screens.
- Flat-color UI only: black and white are the foundation, with restrained orange (#FF7A1A) accents; no gradients.
- Error screens can be previewed from Settings; HTTP 404/402 responses route to the matching screen.
- Project screen clearly indicates that project sync/local file access is not connected yet.

## Build a debug APK

Requirements: JDK 17, Android SDK Platform 35, and Gradle 8.9.

From this directory run:

```bash
gradle :app:assembleDebug
```

APK output:

`app/build/outputs/apk/debug/app-debug.apk`

The GitHub Actions workflow at `.github/workflows/build-apk.yml` builds debug and release APKs. Push a version tag such as `v0.1.0` to build the APKs and publish a GitHub Release with the tagged APK attached. The release APK currently uses the Android debug signing key for easy testing; configure a private signing keystore before distributing a production release.

## Connect an AI provider

Open **Settings** in the app and enter:

- API base URL, e.g. `https://api.openai.com`
- Model name supported by your provider
- API key

The app sends a non-streaming request to `/v1/chat/completions` (or `/chat/completions` if the base URL already ends in `/v1`). The endpoint must support the OpenAI chat-completions request/response shape. Provider usage may incur charges. Do not put secrets in screenshots or source control.

## Not yet implemented

This is the native mobile foundation, not full feature parity with the Electron desktop app. The existing desktop agent runtime, local filesystem access, project synchronization, visual canvas editor, exports, and terminal execution are not bridged to Android yet. The mobile app currently provides AI chat through a compatible remote API. Do not expose a computer's terminal to a phone without a separately designed authenticated and sandboxed backend.
