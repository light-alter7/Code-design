import type { CapabilityContext, CapabilityManifest, CapabilityRuntime } from './types.js';

export class CapabilityRegistry {
  private readonly runtimes = new Map<string, CapabilityRuntime>();

  register(runtime: CapabilityRuntime): void {
    if (!runtime.manifest.id.trim()) throw new Error('Capability id is required');
    if (this.runtimes.has(runtime.manifest.id)) throw new Error(`Capability already registered: ${runtime.manifest.id}`);
    this.runtimes.set(runtime.manifest.id, runtime);
  }

  unregister(id: string): boolean { return this.runtimes.delete(id); }
  get(id: string): CapabilityRuntime | undefined { return this.runtimes.get(id); }
  list(kind?: CapabilityManifest['kind']): CapabilityManifest[] {
    return [...this.runtimes.values()].filter((r) => !kind || r.manifest.kind === kind).map((r) => r.manifest);
  }

  canRun(id: string, permissions: ReadonlySet<import('./types.js').CapabilityPermission>): boolean {
    const runtime = this.runtimes.get(id);
    if (!runtime) return false;
    return (runtime.manifest.permissions ?? []).every((permission) => permissions.has(permission));
  }

  getRequiredPermissions(id: string): CapabilityManifest['permissions'] {
    return [...(this.runtimes.get(id)?.manifest.permissions ?? [])];
  }

  async run(id: string, input: unknown, context: CapabilityContext): Promise<unknown> {
    const runtime = this.runtimes.get(id);
    if (!runtime) throw new Error(`Capability not found: ${id}`);
    const permissions = new Set(context.permissions);
    for (const permission of runtime.manifest.permissions ?? []) {
      if (!permissions.has(permission)) throw new Error(`Permission denied: ${id} requires ${permission}`);
    }
    return runtime.run(input, context);
  }
}
