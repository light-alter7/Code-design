import type { WebFetchResult, WebSource } from '@open-codesign/shared';

export interface MicroFishNetworkOptions {
  baseUrl: string;
  bearerToken?: string;
  timeoutMs: number;
  maxChars: number;
}

function sourceFor(url: string): WebSource {
  return {
    id: `src_${Buffer.from(url).toString('base64url').slice(0, 24)}`,
    url,
    title: null,
    publisher: null,
    publishedAt: null,
    retrievedAt: new Date().toISOString(),
    excerpt: null,
    locator: null,
    originalRead: false,
  };
}

function normalizeUrl(raw: string): URL {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('MicroFish endpoint must be an HTTP(S) URL without embedded credentials.');
  return url;
}

async function call(
  options: MicroFishNetworkOptions,
  path: string,
  payload?: unknown,
  signal?: AbortSignal,
): Promise<any> {
  const base = normalizeUrl(options.baseUrl);
  const endpoint = new URL(path, `${base.href.replace(/\/$/u, '')}/`).href;
  const response = await fetch(endpoint, {
    method: payload === undefined ? 'GET' : 'POST',
    signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(options.timeoutMs)]),
    headers: {
      Accept: 'application/json',
      ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(options.bearerToken ? { Authorization: `Bearer ${options.bearerToken}` } : {}),
      'User-Agent': 'OpenCoDesign-MicroFish/1',
    },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });
  if (!response.ok) throw new Error(`MicroFish bridge HTTP ${response.status}.`);
  return response.json();
}

function textFrom(result: any): string {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    if (typeof result.text === 'string') return result.text;
    if (typeof result.content === 'string') return result.content;
    if (Array.isArray(result.content)) {
      return result.content.map((x: any) => (typeof x?.text === 'string' ? x.text : '')).filter(Boolean).join('\n');
    }
  }
  return JSON.stringify(result);
}

export function createMicroFishNetwork(options: MicroFishNetworkOptions) {
  return {
    async search(query: string, count: number, signal?: AbortSignal): Promise<WebSource[]> {
      const raw = await call(options, '/search', { query, count }, signal);
      const rows = Array.isArray(raw?.results) ? raw.results : Array.isArray(raw) ? raw : [];
      const out: WebSource[] = [];
      for (const item of rows) {
        const url = typeof item?.url === 'string' ? item.url : '';
        if (!url) continue;
        try { normalizeUrl(url); } catch { continue; }
        const source = {
          ...sourceFor(url),
          title: typeof item?.title === 'string' ? item.title.slice(0, 500) : null,
          excerpt: typeof item?.content === 'string' ? item.content.slice(0, Math.min(options.maxChars, 2000)) : null,
          originalRead: false,
        } satisfies WebSource;
        out.push(source);
        if (out.length >= count) break;
      }
      return out;
    },

    async fetch(rawUrl: string, signal?: AbortSignal): Promise<WebFetchResult> {
      const safe = normalizeUrl(rawUrl).href;
      const raw = await call(options, '/fetch', { url: safe }, signal);
      const text = textFrom(raw).slice(0, options.maxChars);
      return {
        source: {
          ...sourceFor(safe),
          excerpt: text.slice(0, Math.min(options.maxChars, 2000)),
          originalRead: true,
          originalText: text,
        },
        finalUrl: safe,
        contentType: 'text/markdown',
        text,
        truncated: textFrom(raw).length > text.length,
      };
    },
  };
}

export function microFishConfigured(): boolean {
  return Boolean(process.env.MICROFISH_URL?.trim());
}

export function microFishFromEnv(maxChars: number, timeoutMs: number) {
  const baseUrl = process.env.MICROFISH_URL?.trim();
  if (!baseUrl) return undefined;
  const bearerToken = process.env.MICROFISH_BRIDGE_TOKEN?.trim() || undefined;
  return createMicroFishNetwork({ baseUrl, timeoutMs, maxChars, ...(bearerToken ? { bearerToken } : {}) });
}
