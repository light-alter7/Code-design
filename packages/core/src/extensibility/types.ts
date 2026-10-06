export type CapabilityKind = 'skill' | 'connector' | 'plugin' | 'extension';

export type CapabilityPermission = 'read' | 'write' | 'network' | 'process';

export interface CapabilityManifest {
  id: string;
  name: string;
  version: string;
  kind: CapabilityKind;
  description: string;
  permissions?: CapabilityPermission[];
  entry?: string;
  compatibleAppVersion?: string;
  enabledByDefault?: boolean;
}

export interface CapabilityContext {
  projectId?: string;
  workspacePath?: string;
  signal?: AbortSignal;
  permissions: ReadonlySet<CapabilityPermission>;
}

export interface CapabilityRuntime<T = unknown> {
  manifest: CapabilityManifest;
  run(input: unknown, context: CapabilityContext): Promise<T>;
}
