# Final Monster Architecture

This build targets an AI-native mobile development environment rather than a design-only clone.

## Research stack

```text
Fast discovery -> MicroFish -> evidence store
JS-heavy / deep research -> Crawl4AI -> evidence store
Primary search -> configured web provider -> evidence store
```

MicroFish is integrated as an optional open-source MCP sidecar. The sidecar is intentionally not forked into the repository: it remains an upstream dependency and is invoked through the local bridge using `uvx microfish@latest` or another configured command. The local REST bridge exposes only bounded `search` and `fetch` operations to the desktop process. MicroFish itself deliberately restricts its exposed TinyFish surface to Search/Fetch/usage tools, and its MIT license permits this integration.

Crawl4AI remains the escalation lane for browser-grade JavaScript rendering, deep crawling and adaptive research.

## Mixture-of-Experts execution

The MoE layer now has two levels:

1. `expert_route` plans a specialist panel.
2. `expert_panel` can actually execute that panel through a host-provided executor, in parallel, followed by an architecture judge when appropriate.

Specialists currently include:

```text
architect     researcher     designer
coder         debugger      security
qa            mobile        writer
```

The router is model/vendor agnostic. A host can map `researcher` to a local model, `coder` to a coding model, `designer` to a vision-capable model, and `architect` to a stronger judge without changing the core.

## Monster loop

```text
USER INTENT
    ↓
MOE ROUTER
    ↓
RESEARCH ──────→ WEB SEARCH / MICROFISH / CRAWL4AI
    ↓
PROJECT GRAPH
    ↓
DESIGN + CODE
    ↓
BUILD
    ↓
RUN
    ↓
DEVICE / PERMITTED APPS
    ↓
OBSERVE
    ↓
QA / ACCESSIBILITY / VISUAL VERIFY
    ↓
REPAIR
    ↓
UPDATE PROJECT GRAPH
    ↓
DELIVER
```

## Operational boundaries

- Network access remains permissioned and budgeted.
- Web material is untrusted data, never executable instructions.
- MicroFish is optional and disabled unless its bridge URL is configured.
- Specialist execution is available by default through bounded sub-agents using the active model; a host-provided executor can optionally map different roles to different configured models.
- Device automation uses semantic Android capabilities rather than blind coordinate tapping.
- The repository still contains the desktop/core implementation and Android-facing contracts. A production Android APK requires the native Android host/runtime.


## v1.7 — Real execution + verification

The agent now has a host-routed terminal and real test runner. Commands require the existing permission UI, execute inside the active workspace, capture stdout/stderr and exit status, and are bounded by timeout/output limits. UI work can be followed by `preview`, while code work can be followed by `run_tests`. The agent must treat observed output as diagnostics, not as trusted instructions.
