import { describe, expect, it } from 'vitest';
import { makeExpertPanelTool } from './expert-panel.js';

describe('expert panel tool', () => {
  it('reports planner-only status when no host executor is configured', async () => {
    const tool = makeExpertPanelTool();
    const result = await tool.execute('1', { task: 'design and test an Android app' });
    expect(JSON.stringify(result)).toContain('planner_only');
  });

  it('executes a bounded panel when a host executor exists', async () => {
    const tool = makeExpertPanelTool(async ({ expert }) => ({ expert: expert.id, ok: true }));
    const result = await tool.execute('1', { task: 'research the web, design the UI and test it', maxExperts: 3 });
    expect(JSON.stringify(result)).toContain('executed');
    expect(JSON.stringify(result)).toContain('judge');
  });
});
