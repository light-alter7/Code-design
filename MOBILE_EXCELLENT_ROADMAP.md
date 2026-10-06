# Mobile Excellent roadmap

The mobile product target is feature parity with the core Claude Design workflow while remaining local-first. Claude Design currently combines conversation + canvas, direct canvas editing, comments, design systems, project context, versioning, exports, and handoff to coding workflows.

## Implemented foundation

- Full-screen mobile chat/preview workspace
- Touch-sized navigation and safe-area handling
- Project file browser inside the mobile workspace
- Mobile Studio action center
- Design refinement, accessibility, visual QA, code-review and design-system actions
- Comments interaction entry point
- Local workspace and snapshot architecture inherited from the core application
- Capability registry for skills/connectors/plugins/extensions with explicit permissions

## Next implementation tiers

### Tier 1 — Design parity
- Direct drag/resize/align controls on mobile
- Component selection and property inspector
- Inline canvas comments
- Multi-screen flow navigator
- Design-system token inspector
- Variation generation (2–3 alternatives)
- Persistent revision timeline

### Tier 2 — Engineering parity
- One-tap design → code handoff
- Source diff/review view
- Visual regression snapshots
- Accessibility and responsive QA reports
- Git branch/commit workflow
- Export HTML/ZIP/PDF/PPTX where supported by the existing exporter

### Tier 3 — Local agent platform
- On-device/local model adapters where hardware permits
- Local model server adapters
- Offline project editing and queued agent tasks
- Sandboxed local tool execution
- Extension marketplace/installer with signature and permission checks
- Connector vault and per-project permissions

## Quality gate

Every mobile feature must satisfy: touch usability, keyboard safety, accessibility, reduced motion, error recovery, local persistence, responsive behavior, and test coverage before being considered complete.
