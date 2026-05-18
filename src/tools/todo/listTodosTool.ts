// Concept: Tools — model-controlled functions the server exposes for the LLM to invoke.
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools
//
// Also demonstrates:
//   • Tool annotations (readOnlyHint) — signals this tool does not modify state.
//   • Structured output (outputSchema) — defines the shape of structuredContent
//     so clients and LLMs can parse the result programmatically. When using
//     outputSchema, return { structuredContent, content } directly instead of
//     using the toolResponse() helper.
// https://modelcontextprotocol.io/specification/2025-11-25/server/tools#output-schema

import { z } from 'zod';
import { listTodos } from '../../client.js';
import { errorMessage, type ToolDefinition, toolResponse } from '../registry.js';

const inputSchema = {
  filter: z.string().optional().describe('Optional text to filter todos by title or description'),
};

const todoShape = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  description: z.string().optional(),
});

const outputSchema = {
  todos: z.array(todoShape).describe('The list of todos'),
  count: z.number().describe('Total number of todos returned'),
};

const callback: ToolDefinition<{ filter?: string }>['callback'] = async ({ filter }, extra) => {
  try {
    const todos = listTodos(extra.sessionId ?? 'default', filter);

    // When outputSchema is defined, return structuredContent directly.
    // The SDK validates it against the schema before sending to the client.
    return {
      structuredContent: { todos, count: todos.length },
      content: [{ type: 'text' as const, text: JSON.stringify(todos, null, 2), mimeType: 'application/json' as const }],
      isError: false,
    };
  } catch (error) {
    return toolResponse({
      errors: [{ detail: `Failed to list todos: ${errorMessage(error)}` }],
    });
  }
};

export const listTodosTool: ToolDefinition<{ filter?: string }> = {
  title: 'List Todos',
  description: 'List all todos for the current session, optionally filtered by text',
  annotations: { readOnlyHint: true },
  inputSchema,
  outputSchema,
  callback,
};
