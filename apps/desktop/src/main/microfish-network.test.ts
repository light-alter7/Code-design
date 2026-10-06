import { describe, expect, it, vi } from 'vitest';
import { createMicroFishNetwork } from './microfish-network';

describe('microfish network adapter', () => {
  it('normalizes search results', async () => {
    const fake = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ results: [{ url: 'https://example.com', title: 'Example', content: 'hello' }] }), { status: 200 }),
    );
    try {
      const network = createMicroFishNetwork({ baseUrl: 'http://127.0.0.1:8765', timeoutMs: 1000, maxChars: 1000 });
      const sources = await network.search('hello', 1);
      expect(sources[0]?.url).toBe('https://example.com/');
      expect(sources[0]?.title).toBe('Example');
    } finally {
      fake.mockRestore();
    }
  });
});
