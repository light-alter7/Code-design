import { describe, expect, it } from 'vitest';
import { CapabilityRegistry } from './registry.js';

describe('CapabilityRegistry', () => {
  it('registers and lists capabilities by kind', () => {
    const registry = new CapabilityRegistry();
    registry.register({
      manifest: { id: 'review', name: 'Review', version: '1.0.0', kind: 'skill', description: 'Review designs' },
      run: async () => 'ok',
    });
    expect(registry.list('skill')).toHaveLength(1);
    expect(registry.get('review')?.manifest.name).toBe('Review');
  });

  it('enforces declared permissions before execution', async () => {
    const registry = new CapabilityRegistry();
    registry.register({
      manifest: {
        id: 'deploy', name: 'Deploy', version: '1.0.0', kind: 'connector', description: 'Deploy', permissions: ['network'],
      },
      run: async () => 'deployed',
    });
    await expect(registry.run('deploy', {}, { permissions: new Set() })).rejects.toThrow('Permission denied');
    await expect(registry.run('deploy', {}, { permissions: new Set(['network']) })).resolves.toBe('deployed');
  });
});
