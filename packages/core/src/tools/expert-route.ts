import { Type } from '@sinclair/typebox';
import type { AgentTool } from '@mariozechner/pi-agent-core';
import type { TSchema } from '@sinclair/typebox';
import { listExperts, routeExperts } from '../experts/mixture-of-experts.js';

export function makeExpertRouteTool(): AgentTool<TSchema, unknown> {
  return {
    name: 'expert_route',
    label: 'Route to specialist experts',
    description:
      'Select specialist roles for a task using the local mixture-of-experts router. This only plans expert roles; the host decides which configured models execute them.',
    parameters: Type.Object({
      task: Type.String({ minLength: 1, maxLength: 4000 }),
      maxExperts: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })),
    }, { additionalProperties: false }),
    async execute(_id: string, params: { task: string; maxExperts?: number }) {
      return {
        route: routeExperts(params.task, params.maxExperts ?? 3),
        availableExperts: listExperts().map(({ id, description }) => ({ id, description })),
        executionNote: 'Expert roles are provider-agnostic. Use separate configured models when available, then synthesize and verify.',
      };
    },
  } as unknown as AgentTool<TSchema, unknown>;
}
