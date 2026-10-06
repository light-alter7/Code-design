import type { LoomSystem1, LoomTask, LoomStageEvent } from './types.js';
import { ProjectGraph } from './project-graph.js';

export interface LoomMonsterHooks {
  research?: (task: LoomTask) => Promise<unknown>;
  design?: (task: LoomTask) => Promise<unknown>;
  code?: (task: LoomTask) => Promise<unknown>;
  build?: (task: LoomTask) => Promise<unknown>;
  run?: (task: LoomTask) => Promise<unknown>;
  observe?: (task: LoomTask) => Promise<unknown>;
  verify?: (task: LoomTask) => Promise<unknown>;
  repair?: (task: LoomTask, failure: unknown) => Promise<unknown>;
}

export interface LoomMonsterOptions {
  system1: LoomSystem1;
  graph?: ProjectGraph;
  hooks?: LoomMonsterHooks;
  maxRepairCycles?: number;
  onEvent?: (event: LoomStageEvent) => void;
}

function emit(options: LoomMonsterOptions, stage: LoomStageEvent['stage'], status: LoomStageEvent['status'], summary: string, details?: unknown) {
  options.onEvent?.({ stage, status, summary, ...(details === undefined ? {} : { details }), at: new Date().toISOString() });
}

/** The end-to-end Code Design agent loop: decide → research/design/code → build → run → observe → verify → repair. */
export async function runLoomMonster(task: LoomTask, options: LoomMonsterOptions): Promise<{ ok: boolean; events: LoomStageEvent[]; graph: ReturnType<ProjectGraph['snapshot']> }> {
  const events: LoomStageEvent[] = [];
  const record = (stage: LoomStageEvent['stage'], status: LoomStageEvent['status'], summary: string, details?: unknown) => {
    const event = { stage, status, summary, ...(details === undefined ? {} : { details }), at: new Date().toISOString() } satisfies LoomStageEvent;
    events.push(event); options.onEvent?.(event);
  };
  const graph = options.graph ?? new ProjectGraph();

  record('plan', 'started', 'Classifying the task and selecting the next capability.');
  const route = await options.system1.decide(task.state ?? task.goal, [{
    id: 'next_stage', kind: 'choice', question: 'What is the next primary stage for this task?',
    options: ['research', 'design', 'code', 'build', 'verify'],
  }]);
  record('plan', 'completed', `System 1 selected ${String(route[0]?.value ?? 'code')}.`, route);

  const stages: Array<{ stage: LoomStageEvent['stage']; hook?: (task: LoomTask) => Promise<unknown> }> = [
    { stage: 'research', hook: options.hooks?.research },
    { stage: 'design', hook: options.hooks?.design },
    { stage: 'code', hook: options.hooks?.code },
    { stage: 'build', hook: options.hooks?.build },
    { stage: 'run', hook: options.hooks?.run },
    { stage: 'observe', hook: options.hooks?.observe },
  ];

  for (const item of stages) {
    if (!item.hook) { record(item.stage, 'skipped', `No ${item.stage} executor is connected.`); continue; }
    record(item.stage, 'started', `Running ${item.stage}.`);
    try { const result = await item.hook(task); record(item.stage, 'completed', `${item.stage} completed.`, result); }
    catch (error) { record(item.stage, 'failed', `${item.stage} failed.`, error); }
  }

  let verification: unknown = undefined;
  for (let cycle = 0; cycle <= (options.maxRepairCycles ?? 2); cycle++) {
    if (!options.hooks?.verify) { record('verify', 'skipped', 'No verifier is connected.'); break; }
    record('verify', 'started', `Verification cycle ${cycle + 1}.`);
    verification = await options.hooks.verify(task);
    const decision = await options.system1.decide(verification, [{ id: 'verified', kind: 'noul', question: 'Does the implementation pass the supplied verification evidence?' }]);
    const passed = decision[0]?.value === true || decision[0]?.value === 'true';
    record('verify', passed ? 'completed' : 'failed', passed ? 'Verification passed.' : 'Verification failed.', { verification, decision });
    if (passed) { record('complete', 'completed', 'Monster loop completed successfully.'); return { ok: true, events, graph: graph.snapshot() }; }
    if (!options.hooks?.repair || cycle >= (options.maxRepairCycles ?? 2)) break;
    record('repair', 'started', `Repair cycle ${cycle + 1}.`);
    const repair = await options.hooks.repair(task, verification);
    record('repair', 'completed', 'Repair completed.', repair);
    graph.upsertNode({ id: `repair-${cycle + 1}`, type: 'workflow', name: `Repair cycle ${cycle + 1}`, metadata: { verification } });
  }

  record('complete', 'failed', 'Monster loop stopped without a verified result.', verification);
  return { ok: false, events, graph: graph.snapshot() };
}
