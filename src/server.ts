import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import copilotChat from './tools/copilotChat';
import { loadModelsConfig, makeInputSchema } from './tools/copilotChat.schema';

export async function start() {
  const server = new FastMCP({
    name: 'mcp-copilot-cli',
    version: '1.0.0',
  });

  const { models } = loadModelsConfig();
  const Parameters = makeInputSchema(models);

  server.addTool({
    name: 'copilot.chat',
    description: 'Run GitHub Copilot CLI in chat mode (non-interactive preferred).',
    parameters: Parameters as unknown as z.ZodTypeAny,
    execute: async (args: unknown) => {
      const parsed = Parameters.parse(args);
      const res = await copilotChat(parsed);
      // Return raw JSON string (spec requires raw stdout/stderr/exitCode)
      return JSON.stringify(res);
    },
  });

  server.start({ transportType: 'stdio' });
}

if (require.main === module) {
  void start();
}

export default start;
