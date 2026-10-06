import { describe, expect, it } from 'vitest';
import { routeExperts, runMixtureOfExperts } from './mixture-of-experts.js';

describe('mixture-of-experts router', () => {
  it('routes mobile app tasks to mobile/security specialists', () => {
    const route = routeExperts('Build an Android app bridge with permissions and intents', 4);
    const ids = route.assignments.map((a) => a.expert.id);
    expect(ids).toContain('mobile');
    expect(ids).toContain('security');
  });

  it('creates a judge-backed panel for complex tasks', () => {
    const route = routeExperts('Research the web, design a UI, implement code and test it', 4);
    expect(route.mode).toBe('panel-and-judge');
    expect(route.judge).toBe('architect');
  });

  it('executes specialists concurrently and then synthesizes with the judge', async () => {
    const calls: string[] = [];
    const result = await runMixtureOfExperts(
      'research design code and test',
      async ({ expert, task }) => {
        calls.push(`${expert.id}:${task.includes('Review and synthesize') ? 'judge' : 'expert'}`);
        return expert.id;
      },
      { maxExperts: 4 },
    );
    expect(result.results.length).toBe(4);
    expect(result.judge?.expert).toBe('architect');
    expect(calls.filter((call) => call.endsWith(':expert')).length).toBe(4);
    expect(calls.some((call) => call === 'architect:judge')).toBe(true);
  });
});
