# Local-first architecture

This product is designed around a local project workspace. Design files, generated source, snapshots, comments, and project metadata remain in the local workspace unless a feature explicitly requires an external provider.

## Principles

- Local project files are the source of truth.
- AI providers are replaceable adapters, not the storage layer.
- BYOK/provider credentials stay in the existing secure configuration path.
- Skills, connectors, plugins, and extensions receive explicit capabilities and permissions.
- Network and process access must be opt-in.
- A design can be exported as a portable project without requiring the original provider.

## Mobile goal

The Android/mobile experience should expose the same project model as desktop: chat, canvas/preview, files, comments, design-system context, agent runs, snapshots, and export. Mobile should be a full creation surface, not a viewer.
