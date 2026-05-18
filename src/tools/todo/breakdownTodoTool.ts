// Concept: Sampling — server-initiated LLM interaction via the client.
// The server sends a sampling/createMessage request to the client, which forwards
// it to the LLM and returns the response. This enables agentic, recursive workflows.
// https://modelcontextprotocol.io/specification/2025-11-25/client/sampling

import type { ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { type ToolDefinition, toolResponse } from '../registry.js';

const inputSchema = {
  todoId: z.string().describe('The ID of the todo to break down into subtasks'),
  depth: z.enum(['shallow', 'detailed']).optional().default('shallow').describe('How detailed the breakdown should be'),
};

const callback: ToolDefinition<{ todoId: string; depth?: string }>['callback'] = async ({ todoId, depth }, extra) => {
  const depthInstructions = {
    shallow: 'Give a concise 3-5 step breakdown. Keep each step to one sentence.',
    detailed: 'Give a thorough breakdown with sub-steps, time estimates, and potential blockers for each step.',
  };

  const prompt = `Break down the following todo into actionable subtasks:

Todo ID: "${todoId}"

${depthInstructions[depth as keyof typeof depthInstructions] ?? depthInstructions.shallow}

Format as a numbered list. Be practical and specific.`;

  try {
    const response = await extra.sendRequest(
      {
        method: 'sampling/createMessage',
        params: {
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: prompt },
            },
          ],
          maxTokens: 800,
          temperature: 0.7,
        },
      } as ServerRequest,
      z.object({
        model: z.string(),
        stopReason: z.string().optional(),
        role: z.string(),
        content: z.object({
          type: z.string(),
          text: z.string(),
        }),
      }),
    );

    return toolResponse({
      data: {
        todoId,
        breakdown: response.content.text,
        depth,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        usedSampling: true,
      },
    });
  } catch (error) {
    return toolResponse({
      errors: [
        {
          detail: `Failed to generate breakdown for todo '${todoId}': ${error instanceof Error ? error.message : String(error)}`,
          meta: {
            troubleshooting: ['Ensure the client supports sampling/createMessage', 'Verify the todo ID is valid'],
          },
        },
      ],
    });
  }
};

export const breakdownTodoTool: ToolDefinition<{ todoId: string; depth?: string }> = {
  title: 'Break Down Todo',
  description:
    'Use AI sampling to generate an actionable subtask breakdown for a todo. Demonstrates the sampling capability.',
  inputSchema,
  callback,
};
