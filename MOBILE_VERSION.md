# Mobile Version

## Goal

The mobile version is designed for phones first while retaining the desktop codebase as the primary runtime foundation.

The goal is **usable mobile interaction**, not simply scaling the desktop layout down.

## Mobile priorities

1. Prompt and chat interaction
2. Fast preview inspection
3. Touch-friendly controls
4. Keyboard-safe layouts
5. File and source access when required
6. Skills/connectors/plugins/extensions without overwhelming the screen

## Navigation model

On a phone, large simultaneous desktop panes should be avoided. The recommended model is a focused pane switcher:

```text
┌──────────────────────────────┐
│ Header / project              │
├──────────────────────────────┤
│                              │
│        Active workspace       │
│                              │
├──────────────────────────────┤
│ Chat            Preview       │
└──────────────────────────────┘
```

Chat and Preview are the two primary surfaces. Secondary panels should open as focused sheets/pages rather than forcing a desktop-style multi-column layout.

## Keyboard handling

Mobile browsers and embedded webviews can change the visual viewport when the software keyboard opens. Mobile UI code should use the visual viewport where available and avoid fixed controls being hidden behind the keyboard.

Recommended behavior:

- keep the composer visible while typing
- allow the conversation to scroll independently
- do not permanently resize the whole application based only on the layout viewport
- restore the normal viewport after keyboard dismissal

## Safe areas

Support device cutouts and gesture areas with CSS environment insets such as:

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

## Touch targets

Interactive controls should be large enough to operate comfortably with a finger. Avoid dense desktop-only icon clusters and tiny click targets.

## Small screens

At very narrow widths:

- reduce non-essential header controls
- keep primary actions visible
- avoid horizontal overflow
- allow long model/provider names to truncate safely
- preserve readable text and usable spacing

## Skills, connectors, plugins, extensions on mobile

These resources should use progressive disclosure:

- **Skills:** choose a skill from a compact selector or context action.
- **Connectors:** show connection status and authentication actions without exposing secrets.
- **Plugins:** expose only enabled/available capabilities.
- **Extensions:** load their mobile-compatible UI surface when available.

A resource should not require the user to navigate through a desktop-sized settings page just to perform one action.

## Desktop compatibility

Desktop remains supported. Mobile behavior should be activated through responsive layout and mobile interaction rules rather than duplicating the entire application.

## Native Android note

This document describes the mobile experience. It does **not** claim that the Electron application can be packaged directly as a native Android APK. Native Android packaging requires a compatible runtime/shell and platform-specific integration.
