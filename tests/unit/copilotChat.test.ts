import { describe, it, expect, vi } from 'vitest';
import * as processLib from '../../src/lib/process';
import { copilotChat } from '../../src/tools/copilotChat';
import { loadModelsConfig, makeInputSchema } from '../../src/tools/copilotChat.schema';

describe('copilotChat.schema', () => {
  it('loads model list from config/models.json and validates', () => {
    const cfg = loadModelsConfig();
    expect(Array.isArray(cfg.models)).toBe(true);
    expect(cfg.models.length).toBeGreaterThan(0);
  });

  it('validates input and optional model against whitelist', () => {
    const { models } = loadModelsConfig();
    const schema = makeInputSchema(models);

    // valid without model
    expect(() => schema.parse({ input: 'Hello' })).not.toThrow();

    // valid with allowed model
    const allowed = models[0];
    expect(() => schema.parse({ input: 'Hi', model: allowed })).not.toThrow();

    // invalid with unknown model
    expect(() => schema.parse({ input: 'Hi', model: 'unknown-model-xyz' })).toThrow();

    // invalid empty input
    expect(() => schema.parse({ input: '' })).toThrow();
  });
});


// US2: Fallback to TTY when unknown option is returned
describe('copilotChat fallback (TTY)', () => {
  it('falls back to spawnPty with /model and input when unknown option occurs', async () => {
    const cmdSpy = vi.spyOn(processLib, 'spawnCommand').mockResolvedValue({ stdout: '', stderr: 'unknown option: --model', exitCode: 1 });
    const ptySpy = vi.spyOn(processLib, 'spawnPty').mockResolvedValue({ stdout: 'TTY_OK', stderr: '', exitCode: 0 });

    const res = await copilotChat({ input: 'Hello', model: 'claude-sonnet-4' });

    expect(cmdSpy).toHaveBeenCalled();
    expect(ptySpy).toHaveBeenCalled();
    const args = (cmdSpy as any).mock.calls[0][1];
    expect(args).toEqual(['-p', 'Hello', '--model', 'claude-sonnet-4']);
    const prelude = (ptySpy as any).mock.calls[0][1];
    expect(prelude).toEqual(['/model claude-sonnet-4', 'Hello']);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('TTY_OK');
  });
});
