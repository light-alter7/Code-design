# Research capability routing

The monster research orchestrator should choose the cheapest capable lane:

| Need | Lane |
|---|---|
| quick web discovery | normal search or MicroFish |
| lightweight page fetch | MicroFish |
| multiple search/fetch keys | MicroFish key pool |
| JavaScript-heavy page | Crawl4AI |
| deep site crawl | Crawl4AI |
| adaptive information gathering | Crawl4AI |
| source/evidence persistence | OpenCoDesign evidence store |

MicroFish exposes a deliberately restricted Search/Fetch surface and can pool
multiple TinyFish keys; it does not expose TinyFish's paid Agent/Browser/Batch
operations through its gateway. This makes it a useful low-cost discovery lane.
Crawl4AI remains the escalation lane for browser-grade research.
