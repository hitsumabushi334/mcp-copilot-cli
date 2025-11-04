import { spawn, type ChildProcess } from 'child_process';
import { ptySpawn } from './pty';

export type ErrorType =
  | 'not_installed'
  | 'timeout';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  errorType?: ErrorType;
}

export function spawnCommand(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    let settled = false;
    let stdout = '';
    let stderr = '';
    let child: ChildProcess | undefined;

    const settle = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    try {
      child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    } catch (err: any) {
      if (err && err.code === 'ENOENT') {
        return settle({ stdout: '', stderr: String(err?.message ?? ''), exitCode: -1, errorType: 'not_installed' });
      }
      return settle({ stdout: '', stderr: String(err?.message ?? err), exitCode: -1 });
    }

    child.stdout?.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr?.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    child.on('error', (err: any) => {
      if (err && err.code === 'ENOENT') {
        return settle({ stdout, stderr: `${stderr}${stderr ? '\n' : ''}${String(err?.message ?? '')}`, exitCode: -1, errorType: 'not_installed' });
      }
      return settle({ stdout, stderr: `${stderr}${stderr ? '\n' : ''}${String(err?.message ?? err)}`, exitCode: -1 });
    });

    child.on('close', (code: number | null) => {
      if (settled) return;
      settle({ stdout, stderr, exitCode: code ?? -1 });
    });

    const timer = setTimeout(() => {
      try { child?.kill(); } catch { /* ignore */ }
      settle({ stdout, stderr, exitCode: -1, errorType: 'timeout' });
    }, timeoutMs);
  });
}

export function spawnPty(
  command: string,
  prelude: string[],
  timeoutMs: number,
): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    let settled = false;
    let stdout = '';
    let timer: ReturnType<typeof setTimeout> | undefined;

    const settle = (result: RunResult) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(result);
    };

    let pty: any;
    try {
      pty = ptySpawn(command, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.cwd(),
        env: process.env,
      });
    } catch (err: any) {
      return settle({ stdout: '', stderr: String(err?.message ?? err), exitCode: -1 });
    }

    try {
      for (const line of prelude) {
        // Send line followed by Enter
        pty.write(String(line) + '\r');
      }
    } catch {
      // ignore write errors; exit handler will settle
    }

    pty.onData?.((data: string) => {
      stdout += String(data ?? '');
    });

    pty.onExit?.((ev: { exitCode?: number } | number) => {
      if (settled) return;
      const code = typeof ev === 'number' ? ev : (ev?.exitCode ?? 0);
      settle({ stdout, stderr: '', exitCode: code });
    });

    timer = setTimeout(() => {
      try { pty?.kill?.(); } catch { /* ignore */ }
      settle({ stdout, stderr: '', exitCode: -1, errorType: 'timeout' });
    }, timeoutMs);
  });
}

