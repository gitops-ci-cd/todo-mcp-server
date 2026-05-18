import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { GetPromptResult, ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js';

export interface PromptDefinition<Args extends Record<string, string> = Record<string, string>> {
  title: string;
  description: string;
  argsSchema?: Record<string, unknown>;
  callback: (
    args: Args,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => GetPromptResult | Promise<GetPromptResult>;
}

export const register = <Args extends Record<string, string>>(
  server: McpServer,
  name: string,
  def: PromptDefinition<Args>,
) => {
  server.registerPrompt(
    name,
    // @ts-expect-error — SDK types require Zod schemas; JSON schemas work at runtime
    {
      title: def.title,
      description: def.description,
      ...(def.argsSchema && { argsSchema: def.argsSchema }),
    },
    def.callback,
  );
};
