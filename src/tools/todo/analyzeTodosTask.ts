// Concept: Tasks — durable state machines for long-running tool executions.
// When a tool supports tasks, the server immediately returns a task ID, and the
// client polls for progress/results. Useful for expensive computations or batch
// processing where you don't want to block the request.
// https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks
//
// This tool uses the SDK's experimental task API:
//   • server.experimental.tasks.registerToolTask() — registers a task-based tool
//   • InMemoryTaskStore / InMemoryTaskMessageQueue — built-in in-memory stores
//   • ToolTaskHandler — { createTask, getTask, getTaskResult } interface
//   • execution.taskSupport: 'optional' — clients may invoke as task or normal call

import type { ToolTaskHandler } from '@modelcontextprotocol/sdk/experimental/tasks/interfaces.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { listTodos, type Todo } from '../../client.js';

const inputSchema = {
  sessionId: z.string().describe('The session ID to analyze todos for'),
};

// Simulates an expensive analysis that takes a few seconds.
function analyzeSync(todos: Todo[]): Record<string, unknown> {
  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.length - completed;
  const hasDescriptions = todos.filter((t) => t.description).length;

  return {
    total: todos.length,
    completed,
    pending,
    completionRate: todos.length ? `${Math.round((completed / todos.length) * 100)}%` : 'N/A',
    withDescriptions: hasDescriptions,
    withoutDescriptions: todos.length - hasDescriptions,
    suggestions: [
      ...(pending > 5 ? ['You have many pending todos — consider prioritizing or archiving stale items.'] : []),
      ...(hasDescriptions < todos.length / 2
        ? ['Most todos lack descriptions — adding details helps with planning.']
        : []),
      ...(completed === 0 && todos.length > 0 ? ['No completed todos yet — try tackling a quick win first!'] : []),
      ...(todos.length === 0 ? ['No todos found — create some to get started!'] : []),
    ],
  };
}

// In-memory store for analysis results, keyed by taskId.
const results = new Map<string, Record<string, unknown>>();

export const analyzeTodosTaskHandler: ToolTaskHandler<typeof inputSchema> = {
  createTask: async ({ sessionId }, extra) => {
    // Create the task immediately so the client gets a task ID back.
    const task = await extra.taskStore.createTask({ ttl: 60_000, pollInterval: 1000 });

    const taskId = task.taskId;

    // Kick off the "expensive" work in the background.
    (async () => {
      try {
        // Simulate work with a delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const todos = listTodos(sessionId);
        const analysis = analyzeSync(todos);
        results.set(taskId, analysis);

        // Store the completed result so getTaskResult can return it.
        await extra.taskStore.storeTaskResult(taskId, 'completed', {
          content: [{ type: 'text', text: JSON.stringify(analysis, null, 2), mimeType: 'application/json' }],
          isError: false,
        });
      } catch (error) {
        await extra.taskStore.storeTaskResult(taskId, 'failed', {
          content: [{ type: 'text', text: `Analysis failed: ${error}` }],
          isError: true,
        });
      }
    })();

    return {
      task,
      _meta: {
        'io.modelcontextprotocol/model-immediate-response':
          "Todo analysis is running in the background. I'll check back for results shortly.",
      },
    };
  },

  getTask: async (_args, extra) => {
    const task = await extra.taskStore.getTask(extra.taskId);
    if (!task) {
      throw new Error(`Task ${extra.taskId} not found`);
    }
    return task;
  },

  getTaskResult: async (_args, extra) => {
    const result = await extra.taskStore.getTaskResult(extra.taskId);
    return result as CallToolResult;
  },
};

export const analyzeTodosTaskConfig = {
  title: 'Analyze Todos',
  description:
    'Run a background analysis of all todos in a session. Returns a task that can be polled for results. Demonstrates the Tasks capability for long-running operations.',
  inputSchema,
  annotations: { readOnlyHint: true },
  execution: { taskSupport: 'optional' as const },
};
