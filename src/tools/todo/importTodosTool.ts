// Concept: Elicitation — server-initiated request for structured user input.
// The server sends an elicitation/create request to the client, which presents
// a form to the user and returns their response. Useful for confirmation dialogs
// or collecting additional information mid-workflow.
// https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation
//
// Concept: Progress — servers report incremental progress on long-running requests.
// The client passes a progressToken in _meta; the server sends notifications/progress
// back referencing that token with progress / total values.
// https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/progress
//
// Concept: Logging — servers emit structured log messages to the client via
// notifications/message. Clients can filter by severity level (debug → emergency).
// https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging

import type { ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { upsertTodo } from '../../client.js';
import { type ToolDefinition, toolResponse } from '../registry.js';

const inputSchema = {
  titles: z.array(z.string()).min(1).describe('List of todo titles to import'),
};

const callback: ToolDefinition<{ titles: string[] }>['callback'] = async ({ titles }, extra) => {
  const sessionId = extra.sessionId ?? 'default';
  const progressToken = extra._meta?.progressToken;

  // --- Elicitation: ask the user to confirm before importing ---
  try {
    const confirmation = await extra.sendRequest(
      {
        method: 'elicitation/create',
        params: {
          message: `Import ${titles.length} todo(s)?\n\n${titles.map((t: string) => `• ${t}`).join('\n')}`,
          requestedSchema: {
            type: 'object',
            properties: {
              confirm: {
                type: 'string',
                title: 'Import these todos?',
                enum: ['yes', 'no'],
                enumNames: ['Yes, import them', 'No, cancel'],
              },
            },
            required: ['confirm'],
          },
        },
      } as ServerRequest,
      z.object({
        action: z.enum(['accept', 'decline', 'cancel']),
        content: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      }),
    );

    if (confirmation.action !== 'accept' || confirmation.content?.confirm !== 'yes') {
      return toolResponse({
        data: { imported: 0, message: 'Import cancelled by user' },
      });
    }
  } catch {
    // Client may not support elicitation — proceed without confirmation
  }

  // --- Logging: inform the client we're starting the import ---
  await extra.sendNotification({
    method: 'notifications/message',
    params: { level: 'info', logger: 'todos', data: `Starting import of ${titles.length} todo(s)` },
  });

  // --- Progress: report incremental progress as each todo is created ---
  const created = [];
  for (let i = 0; i < titles.length; i++) {
    const todo = upsertTodo(sessionId, { title: titles[i] });
    created.push(todo);

    if (progressToken !== undefined) {
      await extra.sendNotification({
        method: 'notifications/progress',
        params: {
          progressToken,
          progress: i + 1,
          total: titles.length,
          message: `Imported: ${titles[i]}`,
        },
      });
    }
  }

  // --- Logging: confirm completion ---
  await extra.sendNotification({
    method: 'notifications/message',
    params: { level: 'info', logger: 'todos', data: `Imported ${created.length} todo(s)` },
  });

  return toolResponse({
    data: created,
    meta: { count: created.length },
  });
};

export const importTodosTool: ToolDefinition<{ titles: string[] }> = {
  title: 'Import Todos',
  description:
    'Batch-import multiple todos by title. Asks for user confirmation (elicitation), reports progress, and logs the operation.',
  inputSchema,
  callback,
};
