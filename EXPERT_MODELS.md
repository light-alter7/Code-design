# Expert Model Routing

The expert layer is a bounded ensemble, not a single monolithic prompt.

## Default mode

When the host does not provide `GenerateViaAgentDeps.expertExecutor`, OpenCoDesign automatically launches bounded specialist sub-agents using the active model. Each specialist receives a role-specific system prompt, runs without tools, and returns advice to the primary agent. Complex panels add an architecture judge that synthesizes the specialist outputs.

This is immediately usable, but it is not a sparse neural MoE model. It is an agent-level expert ensemble.

## Multi-model mode

A host can provide `expertExecutor` and map roles independently, for example:

```text
architect  -> strongest reasoning model
researcher -> research-optimized model
coder      -> coding model
security   -> security/reasoning model
designer   -> vision-capable model
qa         -> verification model
mobile     -> mobile-focused model
```

The core router is vendor-agnostic and does not assume any provider SDK.

## Guardrails

- Maximum 5 specialist assignments per panel.
- Specialist calls run without project mutation tools.
- The panel is bounded and cancellable.
- The primary agent remains responsible for implementation and verification.
- Specialist output is advisory; it is not treated as executed work or trusted external evidence.
