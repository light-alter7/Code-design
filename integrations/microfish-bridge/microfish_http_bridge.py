#!/usr/bin/env python3
"""Small REST bridge around the upstream MicroFish MCP server.

The OpenCoDesign desktop host talks to this process over localhost HTTP while
MicroFish itself remains an upstream, external MIT-licensed MCP dependency.
"""
import asyncio
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

try:
    from mcp import Client, StdioServerParameters
except ImportError as exc:  # pragma: no cover - exercised only when optional dep is missing
    raise SystemExit("Install the optional bridge dependencies: pip install -r requirements.txt") from exc


class MicroFishSession:
    def __init__(self) -> None:
        keys = os.environ.get("TINYFISH_KEYS", "")
        self.env = dict(os.environ)
        if keys:
            self.env["TINYFISH_KEYS"] = keys

    async def call(self, tool: str, arguments: dict) -> object:
        server = StdioServerParameters(
            command=os.environ.get("MICROFISH_COMMAND", "uvx"),
            args=[os.environ.get("MICROFISH_PACKAGE", "microfish@latest")],
            env=self.env,
        )
        async with Client(server) as client:
            result = await client.call_tool(tool, arguments)
            if getattr(result, "is_error", False):
                raise RuntimeError(self._text(result))
            structured = getattr(result, "structured_content", None)
            if structured is not None:
                return structured
            return {"content": self._text(result)}

    @staticmethod
    def _text(result: object) -> str:
        parts = []
        for block in getattr(result, "content", []) or []:
            text = getattr(block, "text", None)
            if isinstance(text, str):
                parts.append(text)
        return "\n".join(parts)


SESSION = MicroFishSession()


def run(coro):
    return asyncio.run(coro)


def normalize(result: object) -> object:
    if isinstance(result, dict):
        return result
    if isinstance(result, list):
        return {"results": result}
    return {"result": result}


class Handler(BaseHTTPRequestHandler):
    server_version = "OpenCoDesign-MicroFish-Bridge/1"

    def _write(self, status: int, payload: object) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _authorized(self) -> bool:
        token = os.environ.get("MICROFISH_BRIDGE_TOKEN", "").strip()
        if not token:
            return True
        expected = f"Bearer {token}"
        return self.headers.get("Authorization", "") == expected

    def do_GET(self) -> None:  # noqa: N802
        if not self._authorized():
            self._write(401, {"error": "unauthorized"})
            return
        if urlparse(self.path).path == "/health":
            self._write(200, {"ok": True, "service": "microfish"})
            return
        self._write(404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        if not self._authorized():
            self._write(401, {"error": "unauthorized"})
            return
        path = urlparse(self.path).path
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
            if path == "/search":
                query = str(payload.get("query", "")).strip()
                count = int(payload.get("count", 5))
                if not query or count < 1 or count > 5:
                    raise ValueError("query and count 1..5 are required")
                result = run(SESSION.call("search", {"query": query, "numResults": count}))
                self._write(200, normalize(result))
                return
            if path == "/fetch":
                url = str(payload.get("url", "")).strip()
                if not url.startswith(("http://", "https://")):
                    raise ValueError("public HTTP(S) URL required")
                result = run(SESSION.call("fetch_content", {"url": url}))
                self._write(200, normalize(result))
                return
            self._write(404, {"error": "not_found"})
        except Exception as exc:
            self._write(502, {"error": str(exc)[:1000]})

    def log_message(self, fmt: str, *args) -> None:
        # Keep stdout clean for host tooling; logs belong on stderr.
        import sys
        print(fmt % args, file=sys.stderr)


if __name__ == "__main__":
    host = os.environ.get("MICROFISH_BRIDGE_HOST", "127.0.0.1")
    port = int(os.environ.get("MICROFISH_BRIDGE_PORT", "8765"))
    ThreadingHTTPServer((host, port), Handler).serve_forever()
