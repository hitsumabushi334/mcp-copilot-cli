import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { z } from "zod";

export const ModelsConfigSchema = z.object({
  models: z.array(z.string().min(1)).min(1),
});
export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;

export function loadModelsConfig(cwd: string = process.cwd()): ModelsConfig {
  const candidates: string[] = [];
  const fromEnv = process.env.MCP_COPILOT_MODELS_PATH;
  if (fromEnv && String(fromEnv).trim().length > 0) {
    candidates.push(resolve(String(fromEnv)));
  }
  // User override in current working directory
  candidates.push(join(cwd, "config", "models.json"));
  // Package-default (works after build: dist/tools -> ../.. = package root)
  const pkgDefault = join(__dirname, "..", "..", "config", "models.json");
  candidates.push(pkgDefault);

  for (const p of candidates) {
    try {
      if (!existsSync(p)) continue;
      const raw = readFileSync(p, "utf8");
      const json = JSON.parse(raw);
      return ModelsConfigSchema.parse(json);
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `models.json not found. Tried: ${candidates.join(", ")}. ` +
      `Set MCP_COPILOT_MODELS_PATH or provide config/models.json in the CWD.`
  );
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
