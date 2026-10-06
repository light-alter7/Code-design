"""Local Crawl4AI gateway for OpenCoDesign.

The desktop app talks to this small adapter over localhost. The adapter owns
browser execution and exposes a deliberately narrow /crawl contract, while
Crawl4AI remains an independently upgradeable dependency.
"""
from __future__ import annotations

import os
from typing import Any
from urllib.parse import urlparse

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from crawl4ai import AsyncWebCrawler, AdaptiveCrawler, AdaptiveConfig, BrowserConfig, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy, DFSDeepCrawlStrategy, BestFirstCrawlingStrategy

app = FastAPI(title="OpenCoDesign Crawl4AI Bridge", version="1.0.0")
TOKEN = os.environ.get("CRAWL4AI_API_TOKEN", "").strip()


class CrawlRequest(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=1)
    strategy: str = Field(default="adaptive", pattern="^(bfs|dfs|best-first|adaptive)$")
    max_depth: int = Field(default=2, ge=0, le=5)
    max_pages: int = Field(default=20, ge=1, le=50)
    same_domain: bool = True
    query: str = Field(default="", max_length=1000)


class ExtractRequest(BaseModel):
    url: str
    instruction: str = Field(min_length=1, max_length=4000)


def authorize(authorization: str | None) -> None:
    if TOKEN and authorization != f"Bearer {TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid Crawl4AI bridge token")


def validate_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or parsed.username or parsed.password:
        raise HTTPException(status_code=400, detail="Only credential-free HTTP(S) URLs are supported")
    return url


def serialize(result: Any) -> dict[str, Any]:
    return {
        "url": getattr(result, "url", ""),
        "title": getattr(result, "metadata", {}).get("title") if getattr(result, "metadata", None) else None,
        "markdown": getattr(result, "markdown", "") or "",
        "depth": (getattr(result, "metadata", {}) or {}).get("depth"),
        "score": (getattr(result, "metadata", {}) or {}).get("score"),
        "links": list((getattr(result, "links", {}) or {}).get("internal", {}).keys())[:200],
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "crawler": "crawl4ai"}


@app.post("/crawl")
async def crawl(request: CrawlRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    authorize(authorization)
    start = validate_url(request.urls[0])
    browser = BrowserConfig(headless=True)

    if request.strategy == "bfs":
        strategy = BFSDeepCrawlStrategy(
            max_depth=request.max_depth,
            max_pages=request.max_pages,
            include_external=not request.same_domain,
        )
        config = CrawlerRunConfig(deep_crawl_strategy=strategy, verbose=False)
        async with AsyncWebCrawler(config=browser) as crawler:
            results = await crawler.arun(start, config=config)
            return {"results": [serialize(r) for r in results]}

    if request.strategy == "dfs":
        strategy = DFSDeepCrawlStrategy(
            max_depth=request.max_depth,
            max_pages=request.max_pages,
            include_external=not request.same_domain,
        )
        config = CrawlerRunConfig(deep_crawl_strategy=strategy, verbose=False)
        async with AsyncWebCrawler(config=browser) as crawler:
            results = await crawler.arun(start, config=config)
            return {"results": [serialize(r) for r in results]}

    if request.strategy == "best-first":
        strategy = BestFirstCrawlingStrategy(
            max_depth=request.max_depth,
            max_pages=request.max_pages,
            include_external=not request.same_domain,
        )
        config = CrawlerRunConfig(deep_crawl_strategy=strategy, verbose=False)
        async with AsyncWebCrawler(config=browser) as crawler:
            results = await crawler.arun(start, config=config)
            return {"results": [serialize(r) for r in results]}

    async with AsyncWebCrawler(config=browser) as crawler:
        adaptive = AdaptiveCrawler(
            crawler,
            AdaptiveConfig(
                confidence_threshold=0.8,
                max_pages=request.max_pages,
                top_k_links=5,
                min_gain_threshold=0.05,
            ),
        )
        state = await adaptive.digest(start, request.query or "relevant information")
        pages = adaptive.get_relevant_content(top_k=request.max_pages)
        results = []
        for page in pages:
            results.append({
                "url": page.get("url", ""),
                "title": page.get("title"),
                "markdown": page.get("content", page.get("text", "")),
                "depth": page.get("depth"),
                "score": page.get("score"),
                "links": [],
            })
        return {
            "results": results,
            "confidence": getattr(adaptive, "confidence", None),
            "crawled_urls": getattr(state, "crawled_urls", []),
        }


@app.post("/extract")
async def extract(request: ExtractRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    authorize(authorization)
    url = validate_url(request.url)
    # Extraction is intentionally bounded and model-agnostic here. The caller can
    # use the returned Markdown as input to its configured model/provider.
    async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
        result = await crawler.arun(url, config=CrawlerRunConfig(verbose=False))
        return {"url": result.url, "markdown": (result.markdown or "")[:120000], "instruction": request.instruction}
