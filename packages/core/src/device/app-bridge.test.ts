import { describe, expect, it } from 'vitest';
import { BUILTIN_ANDROID_APP_ACTIONS } from './app-bridge.js';

describe('Device app bridge contract', () => {
  it('exposes semantic Android actions instead of coordinate automation', () => {
    expect(BUILTIN_ANDROID_APP_ACTIONS).toContain('open_app');
    expect(BUILTIN_ANDROID_APP_ACTIONS).toContain('pick_file');
    expect(BUILTIN_ANDROID_APP_ACTIONS).toContain('share_file');
    expect(BUILTIN_ANDROID_APP_ACTIONS).not.toContain('tap_coordinates' as never);
  });
});
