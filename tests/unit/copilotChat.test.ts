import { describe, it, expect } from 'vitest';
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

