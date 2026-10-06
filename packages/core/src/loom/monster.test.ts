import { describe, expect, it } from 'vitest';
import { LayaSystem1 } from './laya.js';
import { ProjectGraph } from './project-graph.js';
import { runLoomMonster } from './monster.js';

describe('Loom monster', () => {
  it('runs build/run/verify and repairs failed verification', async () => {
    let verificationCalls = 0;
    const system1 = new LayaSystem1(async ({ questions }) => questions.map((q) => ({ id: q.id, kind: q.kind, value: q.id === 'verified' ? verificationCalls > 0 : 'code', confidence: 0.99 })));
    const result = await runLoomMonster({ id: 't1', goal: 'Build a login screen' }, {
      system1,
      graph: new ProjectGraph(),
      maxRepairCycles: 1,
      hooks: {
        code: async () => ({ changed: ['Login.tsx'] }),
        build: async () => ({ ok: true }),
        run: async () => ({ ok: true }),
        observe: async () => ({ screenshot: 'available' }),
        verify: async () => { verificationCalls += 1; return { ok: verificationCalls > 1 }; },
        repair: async () => ({ changed: ['Login.tsx'] }),
      },
    });
    expect(result.ok).toBe(true);
    expect(verificationCalls).toBe(2);
    expect(result.graph.nodes).toHaveLength(1);
  });
});
