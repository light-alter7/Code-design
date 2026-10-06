import type { CapabilityPermission } from '../extensibility/types.js';

export type DeviceAppAction =
  | 'open_app'
  | 'open_url'
  | 'pick_file'
  | 'share_file'
  | 'compose_email'
  | 'compose_message'
  | 'create_calendar_event'
  | 'set_alarm'
  | 'show_location';

export interface InstalledAppDescriptor {
  id: string;
  label: string;
  packageName?: string;
  capabilities: DeviceAppAction[];
  connected: boolean;
  permissions: CapabilityPermission[];
}

export interface DeviceAppRequest {
  action: DeviceAppAction;
  appId?: string;
  payload?: Record<string, unknown>;
  requiresConfirmation?: boolean;
}

export interface DeviceAppResult {
  ok: boolean;
  action: DeviceAppAction;
  data?: unknown;
  error?: string;
}

/**
 * Platform-neutral contract for the mobile host. The Android implementation
 * should map these semantic actions to Android Intents/ContentResolver APIs;
 * the agent never needs to know package names or screen coordinates.
 */
export interface DeviceAppBridge {
  listApps(): Promise<InstalledAppDescriptor[]>;
  canExecute(request: DeviceAppRequest): Promise<boolean>;
  execute(request: DeviceAppRequest): Promise<DeviceAppResult>;
}

export const BUILTIN_ANDROID_APP_ACTIONS: DeviceAppAction[] = [
  'open_app',
  'open_url',
  'pick_file',
  'share_file',
  'compose_email',
  'compose_message',
  'create_calendar_event',
  'set_alarm',
  'show_location',
];
