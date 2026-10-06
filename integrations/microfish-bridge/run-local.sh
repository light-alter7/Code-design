#!/usr/bin/env bash
set -euo pipefail

# Optional MicroFish MCP sidecar. Keep credentials in the environment.
# The upstream package is MIT licensed and intentionally remains an external
# dependency so updates are not forked into OpenCoDesign.
exec uvx microfish@latest
