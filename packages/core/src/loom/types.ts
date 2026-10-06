export type LoomDecisionKind = 'choice' | 'score' | 'noul';

export interface LoomDecisionQuestion {
  id: string;
  kind: LoomDecisionKind;
  question: string;
  options?: string[];
  scale?: { min: number; max: number };
}

export interface LoomDecisionResult {
  id: string;
  kind: LoomDecisionKind;
  value: string | number | boolean;
  confidence: number;
  model?: string;
  latencyMs?: number;
}

export interface LoomSystem1 {
  decide(state: unknown, questions: LoomDecisionQuestion[], signal?: AbortSignal): Promise<LoomDecisionResult[]>;
}

export interface ProjectNode {
  id: string;
  type: 'screen' | 'component' | 'file' | 'token' | 'test' | 'asset' | 'workflow';
  name: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectEdge {
  from: string;
  to: string;
  relation: 'contains' | 'uses' | 'renders' | 'defines' | 'tests' | 'imports' | 'depends-on' | 'generated-from';
}

export interface ProjectGraphSnapshot {
  version: 1;
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  updatedAt: string;
}

export interface LoomTask {
  id: string;
  goal: string;
  workspace?: string;
  state?: unknown;
  requestedBy?: string;
}

export type LoomStage = 'plan' | 'research' | 'design' | 'code' | 'build' | 'run' | 'observe' | 'verify' | 'repair' | 'complete';

export interface LoomStageEvent {
  stage: LoomStage;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  summary: string;
  details?: unknown;
  at: string;
}
