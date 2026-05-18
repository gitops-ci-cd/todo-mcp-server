// Concept: Prompts — server-defined message templates that users can select.
// This prompt accepts arguments (todoId) which the client collects before sending.
// Argument values can also be auto-completed via the Completion API.
// https://modelcontextprotocol.io/specification/2025-11-25/server/prompts

import { z } from 'zod';
import type { PromptDefinition } from '../registry.js';

const callback: PromptDefinition<{ todoId: string }>['callback'] = async ({ todoId }) => ({
  messages: [
    {
      role: 'user' as const,
      content: {
        type: 'text' as const,
        text: `Look up todo "${todoId}" using the todos resource template, then summarize it and suggest next steps.`,
      },
    },
  ],
});

export const analyzeTodoPrompt: PromptDefinition<{ todoId: string }> = {
  title: 'Analyze Todo',
  description: 'Look up a todo and provide a summary with suggested actions',
  argsSchema: {
    todoId: z.string().describe('The ID of the todo to analyze'),
  },
  callback,
};
