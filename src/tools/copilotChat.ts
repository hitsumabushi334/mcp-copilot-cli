import { spawnCommand, spawnPty } from "../lib/process";
import {
  loadModelsConfig,
  makeInputSchema,
  type CopilotChatInput,
} from "./copilotChat.schema";

export interface ToolResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  errorType?: "not_installed" | "timeout";
}

export async function copilotChat(
  input: CopilotChatInput
): Promise<ToolResult> {
  const { models } = loadModelsConfig();
  const schema = makeInputSchema(models);
  const parsed: CopilotChatInput = schema.parse(input);

  const args = ["-p", parsed.input];
  if (parsed.model) {
    args.push("--model", parsed.model);
  }
  // 30s timeout per spec (US1 scope)
  const first = await spawnCommand("copilot", args, 30_000);
  // US2: Fallback to TTY when CLI rejects options (e.g., "unknown option")
  if (first.exitCode !== 0 && /unknown option/i.test(first.stderr)) {
    const prelude: string[] = [];
    if (parsed.model) prelude.push(`/model ${parsed.model}`);
    prelude.push(parsed.input);
    return await spawnPty("copilot", prelude, 30_000);
  }
  return first;
}

export default copilotChat;
