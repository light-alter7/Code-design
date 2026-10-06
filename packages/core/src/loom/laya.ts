import type { LoomDecisionQuestion, LoomDecisionResult, LoomSystem1 } from './types.js';

/**
 * Host adapter for Laya System 1. The core stays provider-agnostic: desktop,
 * web or mobile can supply an HTTP/CLI/local inference function.
 */
export type LayaPredict = (input: {
  state: unknown;
  questions: LoomDecisionQuestion[];
  signal?: AbortSignal;
}) => Promise<Array<Omit<LoomDecisionResult, 'id'>> | LoomDecisionResult[]>;

export class LayaSystem1 implements LoomSystem1 {
  constructor(private readonly predict: LayaPredict) {}

  async decide(state: unknown, questions: LoomDecisionQuestion[], signal?: AbortSignal) {
    const started = performance.now();
    const raw = await this.predict({ state, questions, signal });
    const latencyMs = Math.round(performance.now() - started);
    return raw.map((item, index) => ({
      ...item,
      id: item.id || questions[index]?.id || `decision-${index + 1}`,
      latencyMs: item.latencyMs ?? latencyMs,
      confidence: Math.max(0, Math.min(1, item.confidence)),
    }));
  }
}

export function createNoopSystem1(): LoomSystem1 {
  return {
    async decide(_state, questions) {
      return questions.map((q) => ({
        id: q.id,
        kind: q.kind,
        value: q.kind === 'noul' ? false : q.kind === 'score' ? 0 : q.options?.[0] ?? '',
        confidence: 0,
        model: 'noop',
        latencyMs: 0,
      }));
    },
  };
}
