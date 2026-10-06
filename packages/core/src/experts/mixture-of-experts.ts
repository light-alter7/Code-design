/**
 * Local Mixture-of-Experts (MoE) planner.
 *
 * This is deliberately model-provider agnostic: it chooses specialist roles,
 * not vendors. A host can map each role to any configured local/BYOK model.
 * The router can fan out independent experts and then run a judge/synthesizer.
 */

export type ExpertId =
  | 'architect'
  | 'researcher'
  | 'designer'
  | 'coder'
  | 'debugger'
  | 'security'
  | 'qa'
  | 'mobile'
  | 'writer';

export interface ExpertDefinition {
  id: ExpertId;
  description: string;
  strengths: string[];
  weight: number;
}

export interface ExpertAssignment {
  expert: ExpertDefinition;
  score: number;
  reason: string;
}

export interface MoERoute {
  assignments: ExpertAssignment[];
  mode: 'single' | 'panel' | 'panel-and-judge';
  judge: ExpertId | null;
}

const EXPERTS: ExpertDefinition[] = [
  { id: 'architect', description: 'system architecture, decomposition, dependencies', strengths: ['architecture', 'system', 'api', 'database', 'planning', 'design'], weight: 1.0 },
  { id: 'researcher', description: 'web research, source evaluation, evidence synthesis', strengths: ['research', 'web', 'sources', 'compare', 'documentation', 'latest'], weight: 1.0 },
  { id: 'designer', description: 'interaction design, visual systems, responsive UI', strengths: ['design', 'ui', 'ux', 'layout', 'prototype', 'visual'], weight: 1.0 },
  { id: 'coder', description: 'implementation, refactoring, APIs and integration', strengths: ['code', 'implement', 'build', 'refactor', 'typescript', 'python'], weight: 1.0 },
  { id: 'debugger', description: 'failure analysis, repair and root-cause isolation', strengths: ['debug', 'error', 'broken', 'fix', 'repair', 'crash'], weight: 1.0 },
  { id: 'security', description: 'permissions, secrets, trust boundaries and threat review', strengths: ['security', 'permission', 'auth', 'secret', 'privacy', 'threat'], weight: 0.9 },
  { id: 'qa', description: 'functional, visual, accessibility and regression verification', strengths: ['test', 'qa', 'verify', 'accessibility', 'regression', 'quality'], weight: 1.0 },
  { id: 'mobile', description: 'Android/mobile UX, device capabilities and app bridges', strengths: ['android', 'mobile', 'device', 'app', 'intent', 'phone'], weight: 1.0 },
  { id: 'writer', description: 'clear product copy and documentation', strengths: ['write', 'copy', 'docs', 'documentation', 'content'], weight: 0.7 },
];

const aliases: Record<string, string[]> = {
  frontend: ['designer', 'coder'],
  backend: ['architect', 'coder'],
  agent: ['architect', 'coder', 'researcher'],
  browser: ['researcher'],
  apps: ['mobile', 'security'],
  accessibility: ['designer', 'qa'],
};

function normalize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}

export function listExperts(): ExpertDefinition[] {
  return EXPERTS.map((expert) => ({ ...expert, strengths: [...expert.strengths] }));
}

export function routeExperts(task: string, maxExperts = 3): MoERoute {
  const tokens = new Set(normalize(task));
  const expanded = new Set(tokens);
  for (const token of tokens) for (const alias of aliases[token] ?? []) expanded.add(alias);

  const scored = EXPERTS.map((expert) => {
    const hits = expert.strengths.filter((strength) => expanded.has(strength)).length;
    const score = hits * 2 + expert.weight;
    return {
      expert,
      score,
      reason: hits ? `Matched ${hits} task signals: ${expert.strengths.filter((s) => expanded.has(s)).join(', ')}` : 'Generalist fallback for this task',
    };
  }).sort((a, b) => b.score - a.score);

  const assignments = scored.slice(0, Math.max(1, Math.min(maxExperts, 5)));
  const mode: MoERoute['mode'] = assignments.length === 1 ? 'single' : assignments.length >= 3 ? 'panel-and-judge' : 'panel';
  const judge = mode === 'panel-and-judge' ? 'architect' : null;
  return { assignments, mode, judge };
}

export interface ExpertExecutionContext {
  task: string;
  expert: ExpertDefinition;
  signal?: AbortSignal;
}

export interface ExpertExecutionResult<T = unknown> {
  expert: ExpertId;
  output: T;
}

export interface MixtureExecution<T = unknown> {
  route: MoERoute;
  results: ExpertExecutionResult<T>[];
  judge?: ExpertExecutionResult<T>;
}

/**
 * Execute a routed panel. The callback is where the host injects its actual
 * model/provider call, keeping the core router independent of any vendor SDK.
 */
export async function runMixtureOfExperts<T>(
  task: string,
  executor: (context: ExpertExecutionContext) => Promise<T>,
  options: { maxExperts?: number; signal?: AbortSignal } = {},
): Promise<MixtureExecution<T>> {
  const route = routeExperts(task, options.maxExperts ?? 3);
  const results = await Promise.all(
    route.assignments.map(async ({ expert }) => ({
      expert: expert.id,
      output: await executor({ task, expert, signal: options.signal }),
    })),
  );

  let judge: ExpertExecutionResult<T> | undefined;
  if (route.judge) {
    const expert = EXPERTS.find((candidate) => candidate.id === route.judge);
    if (expert) {
      judge = {
        expert: expert.id,
        output: await executor({
          task: `${task}\n\nReview and synthesize these specialist outputs:\n${JSON.stringify(results)}`,
          expert,
          signal: options.signal,
        }),
      };
    }
  }

  return judge ? { route, results, judge } : { route, results };
}
