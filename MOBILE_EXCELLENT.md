# Mobile Excellent

## Product bar

The mobile build is treated as a first-class workspace, not a desktop layout squeezed into a phone.

### Included in this build
- Full-screen Chat and Preview panes with persistent bottom navigation
- Keyboard-safe viewport sizing via `visualViewport`
- Touch-sized navigation targets
- Safe-area aware bottom navigation
- Reduced-motion support
- Mobile actions for design review and code review prompts
- Desktop split-pane behavior remains intact above 700px

## Extensibility bar

Skills, connectors, plugins, and extensions share a typed capability registry with explicit permission checks. Documentation describes the contract; registration is implemented in `packages/core/src/extensibility`.

## Quality gate

A release should pass typecheck, lint, tests, and a manual mobile smoke test on narrow Android dimensions before being called production-ready.
