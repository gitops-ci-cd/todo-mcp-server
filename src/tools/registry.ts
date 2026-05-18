import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
  ToolAnnotations,
} from '@modelcontextprotocol/sdk/types.js';

export { errorMessage, toolResponse } from '../../pkg/responses.js';

export interface ToolDefinition<Args extends Record<string, unknown> = Record<string, unknown>> {
  title: string;
  description: string;
  annotations?: ToolAnnotations;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  callback: (
    args: Args,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => CallToolResult | Promise<CallToolResult>;
}

export const register = <Args extends Record<string, unknown>>(
  server: McpServer,
  name: string,
  def: ToolDefinition<Args>,
) => {
  server.registerTool(
    name,
    {
      title: def.title,
      description: def.description,
      annotations: def.annotations,
      // @ts-expect-error — SDK types require Zod schemas; JSON schemas work at runtime
      inputSchema: def.inputSchema,
      ...(def.outputSchema && { outputSchema: def.outputSchema }),
    },
    def.callback,
  );
};
