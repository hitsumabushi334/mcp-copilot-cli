import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

// Mock child_process.spawn
import { EventEmitter } from "events";

class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn();
}

vi.mock("child_process", () => {
  const spawnMock = vi.fn();
  return { spawn: spawnMock };
});

// Import after mocks
import { spawn as spawnMocked } from "child_process";
import { spawnCommand } from "../../src/lib/process";

describe("spawnCommand (non-interactive)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (spawnMocked as unknown as Mock).mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes command and args through and resolves on close", async () => {
    const child = new FakeChild();
    (spawnMocked as unknown as Mock).mockImplementation(
      (cmd: string, args: string[]) => {
        // Simulate async close
        setTimeout(() => {
          child.stdout.emit("data", Buffer.from("OK"));
          child.stderr.emit("data", Buffer.from(""));
          child.emit("close", 0);
        }, 1);
        return child as any;
      }
    );

    const p = spawnCommand(
      "copilot",
      ["-p", "hello", "--model", "claude-sonnet-4"],
      1000
    );
    vi.advanceTimersByTime(5);
    const res = await p;
    expect((spawnMocked as any).mock.calls[0][0]).toBe("copilot");
    expect((spawnMocked as any).mock.calls[0][1]).toEqual([
      "-p",
      "hello",
      "--model",
      "claude-sonnet-4",
    ]);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain("OK");
    expect(res.errorType).toBeUndefined();
  });

  it("returns timeout when execution exceeds timeoutMs", async () => {
    const child = new FakeChild();
    (spawnMocked as unknown as Mock).mockImplementation(() => {
      // Do not emit close to trigger timeout
      return child as any;
    });

    const p = spawnCommand("copilot", ["-p", "slow"], 10);
    vi.advanceTimersByTime(11);
    const res = await p;
    expect(res.errorType).toBe("timeout");
    expect(child.kill).toHaveBeenCalled();
    expect(res.exitCode).toBe(-1);
  });

  it("maps ENOENT spawn error to not_installed", async () => {
    const child = new FakeChild();
    (spawnMocked as unknown as Mock).mockImplementation(() => child as any);

    const p = spawnCommand("copilot", ["-p", "x"], 1000);
    // emit error from child
    setTimeout(() => {
      child.emit(
        "error",
        Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" })
      );
    }, 1);
    vi.advanceTimersByTime(5);
    const res = await p;
    expect(res.errorType).toBe("not_installed");
    expect(res.exitCode).toBe(-1);
  });
});

// US2: PTY runner tests
describe("spawnPty (interactive)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    ptySpawnMock.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("writes prelude lines and resolves on exit", async () => {
    const writes: string[] = [];
    ptySpawnMock.mockImplementation(() => {
      const pty: any = {
        onDataCb: undefined as undefined | ((d: string) => void),
        onExitCb: undefined as undefined | ((e: { exitCode?: number }) => void),
        write: vi.fn((s: string) => { writes.push(s); }),
        kill: vi.fn(),
        onData(cb: (d: string) => void) { this.onDataCb = cb; },
        onExit(cb: (e: { exitCode?: number }) => void) { this.onExitCb = cb; },
      };
      // simulate async data and exit
      setTimeout(() => {
        pty.onDataCb?.("OK");
        pty.onExitCb?.({ exitCode: 0 });
      }, 1);
      return pty;
    });
    const mod = await import("../../src/lib/process");
    const p = mod.spawnPty("copilot", ["/model claude", "Hello"], 1000);
    vi.advanceTimersByTime(5);
    const res = await p;

    expect(ptySpawnMock).toHaveBeenCalled();
    expect(writes).toEqual(["/model claude\r", "Hello\r"]);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain("OK");
  });

  it("returns timeout when no exit", async () => {
    const ptyRef: any = { kill: vi.fn(), onData() {}, onExit() {}, write() {} };
    ptySpawnMock.mockImplementation(() => ptyRef);
    const mod = await import("../../src/lib/process");
    const p = mod.spawnPty("copilot", [], 10);
    vi.advanceTimersByTime(11);
    const res = await p;
    expect(res.errorType).toBe("timeout");
    expect(ptyRef.kill).toHaveBeenCalled();
    expect(res.exitCode).toBe(-1);
  });
});

// Hoisted mock for pty wrapper used by spawnPty tests
const ptySpawnMock = vi.fn();
vi.mock("../../src/lib/pty", () => ({ ptySpawn: (...args: any[]) => ptySpawnMock(...args) }));
