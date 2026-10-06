import type { AgentTool } from '@mariozechner/pi-agent-core';
import type { TSchema } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { listExperts, runMixtureOfExperts, type ExpertId } from '../experts/mixture-of-experts.js';

export type ExpertExecutor = (context: {
  task: string;
  expert: { id: ExpertId; description: string; strengths: string[]; weight: number };
  signal?: AbortSignal;
}) => Promise<unknown>;

export function makeExpertPanelTool(executor?: ExpertExecutor): AgentTool<TSchema, unknown> {
  return {
    name: 'expert_panel',
    label: 'Run specialist expert panel',
    description:
      'Run a bounded parallel panel of specialist roles. Each role is provider-agnostic; the host maps roles to configured local/BYOK models. A panel can be followed by an architecture judge for synthesis.',
    parameters: Type.Object(
      {
        task: Type.String({ minLength: 1, maxLength: 8000 }),
        maxExperts: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })),
      },
      { additionalProperties: false },
    ),
    async execute(
      _id: string,
      params: { task: string; maxExperts?: number },
      signal?: AbortSignal,
    ) {
      const routePreview = listExperts().map((expert) => ({
        id: expert.id,
        description: expert.description,
      }));
      if (!executor) {
        return {
          status: 'planner_only',
          message:
            'No expert executor is configured in this host. The route is available, but no specialist models were invoked.',
          availableExperts: routePreview,
        };
      }
      const result = await runMixtureOfExperts(params.task, executor, {
        maxExperts: params.maxExperts ?? 3,
        signal,
      });
      return {
        status: 'executed',
        route: result.route,
        results: result.results,
        ...(result.judge ? { judge: result.judge } : {}),
      };
    },
  } as unknown as AgentTool<TSchema, unknown>;
}
