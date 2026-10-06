# App Bridge — Mobile Agent OS

The app is designed to **use the user's permitted mobile apps as tools**, not merely link to them.

## Model

`User intent → Agent → App capability → permission check → semantic device action → result → project state`

The core contract is platform-neutral. Android hosts should map it to native intents and content APIs:

- `open_app`
- `open_url`
- `pick_file`
- `share_file`
- `compose_email`
- `compose_message`
- `create_calendar_event`
- `set_alarm`
- `show_location`

The agent should never depend on blind screen coordinates when a semantic API is available.

## Safety model

Every app action is:

1. Declared as a capability.
2. Checked against granted permissions.
3. Classified as read-only, reversible write, or confirmation-required.
4. Logged in the local agent run history.
5. Confirmed by the user for consequential actions unless the user explicitly enabled a trusted automation policy.

## Android host

The Android shell should implement `DeviceAppBridge` using Android Intents, the Storage Access Framework, and ContentResolver. File selection should preserve URI permissions when long-lived access is required.

This makes the same agent usable with Gmail/Outlook, messaging apps, Maps, Calendar, file providers, browsers, media apps, and other apps that expose compatible Android actions — without hard-coding one vendor.
