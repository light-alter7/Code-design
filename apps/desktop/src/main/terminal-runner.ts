import { spawn } from 'node:child_process';

export interface TerminalRunResult {
  ok: boolean;
  command: string;
  cwd: string;
  exitCode: number | null;
  signal?: string;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut?: boolean;
}

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT = 180_000;

export function runTerminalCommand(input: {
  command: string;
  cwd: string;
  timeoutMs?: number;
  maxOutputChars?: number;
  signal?: AbortSignal;
}): Promise<TerminalRunResult> {
  const timeoutMs = Math.min(Math.max(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, 1_000), 120_000);
  const maxOutputChars = Math.min(Math.max(input.maxOutputChars ?? DEFAULT_MAX_OUTPUT, 1_000), 200_000);
  const started = Date.now();

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    const child = spawn(input.command, {
      cwd: input.cwd,
      shell: true,
      windowsHide: true,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const append = (target: 'stdout' | 'stderr', chunk: Buffer) => {
      const value = chunk.toString();
      if (target === 'stdout') stdout = `${stdout}${value}`.slice(-maxOutputChars);
      else stderr = `${stderr}${value}`.slice(-maxOutputChars);
    };
    child.stdout?.on('data', (chunk: Buffer) => append('stdout', chunk));
    child.stderr?.on('data', (chunk: Buffer) => append('stderr', chunk));

    const finish = (code: number | null, signal?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      input.signal?.removeEventListener('abort', abort);
      resolve({
        ok: code === 0 && !timedOut,
        command: input.command,
        cwd: input.cwd,
        exitCode: code,
        ...(signal ? { signal } : {}),
        stdout,
        stderr,
        durationMs: Date.now() - started,
        ...(timedOut ? { timedOut: true } : {}),
      });
    };
    const terminate = () => {
      try {
        if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM');
        else child.kill('SIGTERM');
      } catch {
        try { child.kill(); } catch { /* already gone */ }
      }
    };
    const abort = () => {
      timedOut = true;
      terminate();
    };
    const timer = setTimeout(() => {
      timedOut = true;
      terminate();
    }, timeoutMs);
    input.signal?.addEventListener('abort', abort, { once: true });
    child.on('error', (error) => {
      stderr = `${stderr}${error instanceof Error ? error.message : String(error)}`.slice(-maxOutputChars);
      finish(null);
    });
    child.on('close', (code, signal) => finish(code, signal ?? undefined));
  });
}
