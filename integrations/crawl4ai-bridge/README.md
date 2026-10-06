# Crawl4AI bridge

This optional local service gives OpenCoDesign a browser-grade research engine.

It is deliberately an adapter rather than a fork of Crawl4AI. The app keeps its
existing evidence store and agent tools; this service supplies the crawling layer.

## Capabilities

- JavaScript-capable browser crawling
- BFS / DFS / best-first deep crawling
- adaptive crawling with confidence/information-gain stopping
- clean Markdown for agent context
- bounded pages/depth
- same-domain restriction by default
- local bearer-token protection

## Run

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
crawl4ai-setup
export CRAWL4AI_API_TOKEN="choose-a-local-token"
uvicorn server:app --host 127.0.0.1 --port 11235
```

Then launch OpenCoDesign with:

```bash
export CRAWL4AI_URL="http://127.0.0.1:11235"
export CRAWL4AI_API_TOKEN="choose-a-local-token"
```

The desktop agent exposes `web_crawl` and `web_extract` when the bridge is configured.
The normal Tavily search path remains available for discovery; Crawl4AI is used for
browser-grade page reading and deep research.
