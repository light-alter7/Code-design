# MicroFish integration

OpenCoDesign can use the open-source **microfish** MCP gateway as a low-cost search/fetch lane alongside the Crawl4AI browser lane.

MicroFish is MIT-licensed and exposes only Search/Fetch-related tools, with optional multi-key pooling and HTTP/stdio MCP transports. The app should treat it as an optional capability, never as a hard dependency.

## Recommended architecture

```text
Research Orchestrator
  ├── normal web search
  ├── MicroFish MCP  -> cheap search/fetch lane
  └── Crawl4AI       -> browser/deep/adaptive lane
```

Use MicroFish for discovery and lightweight fetching. Escalate to Crawl4AI when JavaScript rendering, deep crawling, adaptive research, or browser-grade extraction is needed.

## Local setup

Install the upstream package from PyPI or run its published package with `uvx`:

```bash
uvx microfish@latest
```

For HTTP MCP mode, run MicroFish on localhost and configure the app's MCP connector layer with the endpoint. Keep API keys in environment variables; never commit them to project files.

Environment contract:

```text
MICROFISH_URL=http://127.0.0.1:8000/mcp
MICROFISH_MCP_BEARER=<optional local bearer token>
```

The integration intentionally does not vendor or fork MicroFish. This keeps upstream updates and licensing clean while allowing the agent to select it as a research capability.


## Upstream attribution

This integration uses the external open-source `vvtommy/microfish` project as an optional runtime dependency; it is not vendored into OpenCoDesign. MicroFish is MIT licensed and currently exposes only Search/Fetch/usage tools. See `NOTICE_OPEN_SOURCE.md` for attribution and license metadata.
