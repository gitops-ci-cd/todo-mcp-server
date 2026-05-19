// Concept: Prompts (no arguments) — a prompt that takes no input and produces
// a canned instruction referencing specific tools and resources by name.
// https://modelcontextprotocol.io/specification/2025-11-25/server/prompts
//
// Also demonstrates:
//   • Multi-turn prompts — messages with both "user" and "assistant" roles seed
//     a conversation with pre-filled context. The LLM continues from where the
//     conversation leaves off.

import type { PromptDefinition } from '../registry.js';

const callback: PromptDefinition['callback'] = async () => {
  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: 'I need help organizing my todos.',
        },
      },
      {
        role: 'assistant' as const,
        content: {
          type: 'text' as const,
          text: "Sure! Let me look at your current todos and the prioritization tips, then I'll give you a concrete plan.",
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Great. Specifically, please:

1. Read the todos resource (todos://detail/) to see what I currently have
2. Look at the todos://tips/prioritization resource for prioritization strategies
3. Suggest how I should order and group my current todos
4. Identify any that should be broken down further

Be practical and specific — don't just give generic advice.`,
        },
      },
    ],
  };
};

export const todoCoachPrompt: PromptDefinition = {
  title: 'Todo Coach',
  description: 'Get personalized advice on organizing and prioritizing your current todos',
  callback,
};
