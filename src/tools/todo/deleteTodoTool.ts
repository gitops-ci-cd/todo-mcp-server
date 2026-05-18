// Concept: Tool annotations (destructiveHint) — warns the client that this tool
// permanently removes data, so it should prompt for confirmation before calling.
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools

import { z } from 'zod';
import { deleteTodo } from '../../client.js';
import { errorMessage, type ToolDefinition, toolResponse } from '../registry.js';

const inputSchema = {
  id: z.string().describe('ID of the todo to delete'),
};

const callback: ToolDefinition<{ id: string }>['callback'] = async ({ id }, extra) => {
  try {
    const deleted = deleteTodo(extra.sessionId ?? 'default', id);

    if (!deleted) {
      return toolResponse({
        errors: [{ detail: `Todo '${id}' not found` }],
      });
    }

    return toolResponse({ data: { id } });
  } catch (error) {
    return toolResponse({
      errors: [{ detail: `Failed to delete todo '${id}': ${errorMessage(error)}` }],
    });
  }
};

export const deleteTodoTool: ToolDefinition<{ id: string }> = {
  title: 'Delete Todo',
  description: 'Delete a todo by ID',
  annotations: { destructiveHint: true },
  inputSchema,
  callback,
};
