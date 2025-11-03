import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export const ModelsConfigSchema = z.object({
  models: z.array(z.string().min(1)).min(1),
});
export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;

export function loadModelsConfig(cwd: string = process.cwd()): ModelsConfig {
  const p = join(cwd, 'config', 'models.json');
  const raw = readFileSync(p, 'utf8');
  const json = JSON.parse(raw);
  return ModelsConfigSchema.parse(json);
}

export function makeInputSchema(allowedModels: string[]) {
  const unique = Array.from(new Set(allowedModels));
  // z.enum requires [string, ...string[]] tuple; models.json validation guarantees non-empty
  const ModelEnum = z.enum(unique as [string, ...string[]]);
  return z.object({
    input: z.string().min(1).max(10000),
    model: ModelEnum.optional(),
  });
}

export type CopilotChatInput = z.infer<ReturnType<typeof makeInputSchema>>;
