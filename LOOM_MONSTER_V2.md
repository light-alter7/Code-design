# Code Design Monster v2 — Loom Core foundation

This build turns Code Design into the first Loom-native agent workspace.

## New core

- `packages/core/src/loom/types.ts` — shared Loom task, decision, project-graph and stage contracts.
- `packages/core/src/loom/laya.ts` — provider-neutral adapter for Laya System 1. It can be backed by local CPU/GPU inference, HTTP, or another host implementation.
- `packages/core/src/loom/project-graph.ts` — persistent relationship graph for screens, components, files, tokens, tests, assets and workflows.
- `packages/core/src/loom/monster.ts` — end-to-end orchestration loop:
  `PLAN → RESEARCH → DESIGN → CODE → BUILD → RUN → OBSERVE → VERIFY → REPAIR`.

## Laya strategy

Laya is not used as the main generative model. It is the fast System-1 decision layer for routing, classification, scoring, verification decisions and repair triage. The project exposes an adapter so a fine-tuned Code Design checkpoint can be plugged in later without changing the orchestrator.

Laya's current upstream documentation supports local CPU/NVIDIA GPU serving and domain fine-tuning; its fine-tuning workflow reports a substantial benchmark improvement after specialization. See the upstream project before selecting a checkpoint or license strategy.

## Important validation status

The source package was inspected and the new modules were added, but this environment does not contain `pnpm` or the repository's `node_modules`. Therefore a full workspace typecheck/test run was **not possible here**. Do not treat this archive as a claim of a green full build.

## Next engineering layer

1. Wire `runLoomMonster` into the desktop agent host.
2. Connect existing terminal/preview/verification tools as concrete hooks.
3. Persist `ProjectGraphSnapshot` alongside workspace state.
4. Add a local Laya HTTP/CLI adapter and a fine-tuned Code Design checkpoint when training data is ready.
5. Add the visual agent control surface to the mobile-first UI.
6. Then build the LoomRouter adapter and shared Loom Core package boundary.
