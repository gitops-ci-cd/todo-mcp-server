// Concept: Tool annotations (idempotentHint) — indicates that calling this tool
// repeatedly with the same arguments produces the same result, so retries are safe.
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools

import { z } from 'zod';
import { upsertTodo } from '../../client.js';
import { errorMessage, type ToolDefinition, toolResponse } from '../registry.js';

const inputSchema = {
  id: z.string().optional().describe('ID of an existing todo to update — omit to create a new one'),
  title: z.string().describe('Title of the todo'),
  completed: z.boolean().optional().describe('Whether the todo is completed'),
  description: z.string().optional().describe('Optional description for the todo'),
};

const callback: ToolDefinition<{ id?: string; title: string; completed?: boolean; description?: string }>['callback'] =
  async ({ id, title, completed, description }, extra) => {
    try {
      const todo = upsertTodo(extra.sessionId ?? 'default', { id, title, completed, description });

      return toolResponse({ data: todo });
    } catch (error) {
      return toolResponse({
        errors: [{ detail: `Failed to upsert todo: ${errorMessage(error)}` }],
      });
    }
  };

export const upsertTodoTool: ToolDefinition<{ id?: string; title: string; completed?: boolean; description?: string }> =
  {
    title: 'Upsert Todo',
    description: 'Create a new todo or update an existing one',
    annotations: { idempotentHint: true },
    inputSchema,
    callback,
  };
