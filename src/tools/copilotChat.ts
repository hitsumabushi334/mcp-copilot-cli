import { spawnCommand } from '../lib/process';
import { loadModelsConfig, makeInputSchema, type CopilotChatInput } from './copilotChat.schema';

export interface ToolResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  errorType?: 'not_installed' | 'timeout';
}

export async function copilotChat(input: { input: string; model?: string }): Promise<ToolResult> {
  const { models } = loadModelsConfig();
  const schema = makeInputSchema(models);
  const parsed: CopilotChatInput = schema.parse(input);

  const args = ['-p', parsed.input];
  if (parsed.model) {
    args.push('--model', parsed.model);
  }
  // 30s timeout per spec (US1 scope)
  return await spawnCommand('copilot', args, 30_000);
}

export default copilotChat;

