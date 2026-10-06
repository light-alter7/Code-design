## 1.6.0

- Added executable bounded expert panel with automatic specialist sub-agents.
- Promoted `expert_panel` to a first-class current tool.
- Made MicroFish a true alternate research lane that can operate without a Tavily key when configured.
- Added explicit open-source attribution for MicroFish and Crawl4AI.

# v1.7-microfish-moe

- Added executable Mixture-of-Experts panel tool with host-provided model execution.
- Added optional MicroFish MCP HTTP sidecar and desktop research adapter.
- Added MicroFish-first/fallback routing flags for search and fetch.
- Preserved Crawl4AI as the deep/browser/adaptive escalation lane.

## v1.6 — Final Monster MoE + MicroFish

- Added a provider-agnostic Mixture-of-Experts router with specialist roles for architecture, research, design, coding, debugging, security, QA, mobile and writing.
- Added `expert_route` to the agent tool surface.
- Added an optional MicroFish MCP connector lane for low-cost web search/fetch and multi-key pooling.
- Kept Crawl4AI as the browser/deep/adaptive research escalation lane.
- Added explicit research-lane guidance and capability manifests.


## mobile-personal-final-monster-v1.5

- Added optional Crawl4AI browser research bridge.
- Added `web_crawl` agent tool with bounded BFS, DFS, best-first and adaptive strategies.
- Added `web_extract` browser-grade page preparation tool.
- Added local bearer-token protected Crawl4AI gateway.
- Kept research evidence, source records and existing web search workflow intact.
- Preserved the app capability bridge for permitted mobile app actions.


## [Unreleased] — Mobile Excellent Foundation

### Added
- First-class mobile Chat/Preview workspace navigation with touch-sized controls.
- Visual Viewport keyboard-safe sizing and safe-area-aware mobile navigation.
- Mobile quick actions for design and code review prompts.
- Permission-aware runtime capability registry for skills, connectors, plugins, and extensions.
- Capability registry tests covering registration and permission enforcement.

### Quality
- Desktop split-pane behavior remains unchanged above the mobile breakpoint.
- Reduced-motion behavior is respected for mobile navigation.
# Changelog

## [1.7.0] — Real Terminal + Verification

- Added a permission-gated `terminal` agent tool with real stdout/stderr, exit codes, timing, cancellation, timeouts, and bounded output.
- Added `run_tests` for real typecheck/test/lint/build execution with captured diagnostics.
- Wired terminal execution through the desktop main process and workspace sandbox.
- Agent guidance now requires inspecting actual verification results before claiming success and pairing UI changes with visual preview.


All notable changes in the personal Code Design build are documented here.

## [mobile-personal-v1.0] — 2026-10-05

### Added

- Personal mobile-focused documentation set.
- Dedicated `skills/` architecture and manifest documentation.
- Dedicated `connectors/` architecture and credential-boundary documentation.
- Dedicated `plugins/` architecture for optional capabilities.
- Dedicated `extensions/` architecture for UI/runtime modules.
- Mobile-first product guidance.
- Phone interaction and keyboard/safe-area guidance.
- Mobile build and testing documentation.

### Preserved

- Existing AI provider abstraction.
- Existing model configuration and BYOK workflows.
- Existing generation/editing pipeline.
- Existing workspace/source editing flow.
- Existing preview/runtime system.
- Existing design systems, templates, and exporters.

### Important

This release is a personal documentation/architecture layer over the existing Open CoDesign source. The `skills`, `connectors`, `plugins`, and `extensions` directories define clean extension points; they do not falsely claim that every external service is already implemented.

## Base source

The underlying source tree is based on Open CoDesign `0.2.0` and its pinned source snapshot.
