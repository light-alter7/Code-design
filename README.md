# Code Design — Personal Mobile Build

A personal, mobile-focused build of the Open CoDesign foundation for creating interactive designs, prototypes, decks, and marketing assets with AI.

> **Build:** `mobile-personal-v1.0`  
> **Target:** Android/phone-friendly interaction first, desktop compatibility retained  
> **Base:** Open CoDesign `0.2.0` source tree

## What this build is

Code Design is an AI-assisted design workspace. It combines model providers, prompt-driven generation, source editing, live preview, design resources, and export workflows in one application.

This personal build adds a clear integration architecture around four resource types:

- **Skills** — reusable AI capabilities and task instructions.
- **Connectors** — external services and data sources.
- **Plugins** — optional application-level capabilities.
- **Extensions** — modular UI/runtime additions.

The directories are intentionally separated so future integrations can be added without mixing credentials, model logic, UI code, or reusable AI instructions.

## Core capabilities

- AI-assisted design generation and editing
- Multiple model/provider configurations
- Bring-your-own-key workflows
- Image-aware prompting
- Source-code editing
- Interactive preview
- Design systems and templates
- File/workspace operations
- HTML, Markdown, PDF, PowerPoint, and ZIP export paths
- Reusable skills
- Extensible provider/integration layer
- Mobile-oriented navigation and interaction model

## Resource architecture

```text
Code Design
├── AI / Models
│   └── Provider adapters
├── Skills
│   └── Reusable task-specific instructions
├── Connectors
│   └── External services and data
├── Plugins
│   └── Optional app capabilities
├── Extensions
│   └── UI/runtime modules
├── Workspace
│   ├── Files
│   ├── Source editor
│   └── Design system
└── Mobile experience
    ├── Chat-first navigation
    ├── Preview-first navigation
    ├── Touch controls
    ├── Keyboard-safe layout
    └── Safe-area support
```

## Mobile philosophy

The mobile experience is not a shrunken desktop window. On narrow screens, the application should prioritize one task at a time:

1. **Chat** for prompting and iteration.
2. **Preview** for inspecting the result.
3. **Source/files** when editing is required.
4. **Integrations** only when needed.

The UI should remain usable with touch input, the software keyboard, small screens, and safe-area insets.

See [MOBILE_VERSION.md](MOBILE_VERSION.md) and [docs/MOBILE_BUILD.md](docs/MOBILE_BUILD.md).

## Skills

Skills are reusable AI instructions stored independently from application code. The repository includes a dedicated [skills/](skills/) area and the upstream core skill loader remains available.

A skill should define:

- what it does
- when it should be used
- required inputs
- expected output
- provider restrictions, if any
- safety/permission boundaries

## Connectors

Connectors represent external systems. They should own authentication and data translation rather than placing service-specific logic throughout the renderer.

See [connectors/README.md](connectors/README.md).

## Plugins

Plugins are optional capabilities that can extend the application without becoming part of the core workflow.

See [plugins/README.md](plugins/README.md).

## Extensions

Extensions are modular UI/runtime additions. They can add panels, commands, tools, or integration surfaces while keeping the core application stable.

See [extensions/README.md](extensions/README.md).

## Development

Requirements from the base project:

- Node.js `>=22`
- pnpm `10.33.4`
- A desktop development environment for the Electron build

Install dependencies:

```bash
pnpm install
```

Run the development workspace:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Type-check:

```bash
pnpm typecheck
```

Run tests:

```bash
pnpm test
```

## Mobile development

The mobile documentation describes the responsive renderer and phone-oriented interaction model. This repository is still based on an Electron desktop application; **mobile UI support does not by itself create a native Android APK**.

For a true Android package, a separate Android runtime/shell and platform integration layer are required.

## Versioning

Personal releases use the `mobile-personal-vX.Y` naming scheme.

Current documentation release: `mobile-personal-v1.0`.

See [CHANGELOG.md](CHANGELOG.md) for the project history.

## Security

Never commit API keys, OAuth tokens, personal access tokens, or connector secrets. Store credentials through the application's supported credential flow or the operating system's secure storage.

## Upstream

This personal build is based on the Open CoDesign project. Upstream source and licensing information remain in the original repository metadata and license files.

## Final Monster research + expert stack

The mobile-personal final-monster build can optionally combine **MicroFish** for low-cost Search/Fetch with **Crawl4AI** for browser-grade deep/adaptive crawling. It also includes a provider-agnostic **Mixture-of-Experts** router that can fan a task out to specialist roles and synthesize them through a judge model. See `FINAL_MONSTER.md`, `EXPERT_MODELS.md`, and `integrations/microfish-bridge/`.
