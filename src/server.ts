// Concept: Lifecycle — the McpServer constructor declares server info and
// capabilities. The SDK negotiates these with the client during initialization.
// https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
//
// The SDK also provides many features out of the box without explicit code here:
//   • Ping        — https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/ping
//   • Cancellation— https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation
//   • Pagination  — https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination
//   • Transports  — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
//
// Also demonstrates:
//   • Resource subscriptions — the server emits notifications/resources/updated
//     and notifications/resources/list_changed when todos change, so subscribed
//     clients can refresh automatically.
// https://modelcontextprotocol.io/specification/2025-11-25/server/resources#subscriptions

import {
  InMemoryTaskMessageQueue,
  InMemoryTaskStore,
} from '@modelcontextprotocol/sdk/experimental/tasks/stores/in-memory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import pkg from '../package.json' with { type: 'json' };
import { registerApps } from './apps/index.js';
import { todoEvents } from './client.js';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';

export const initializeServer = (): McpServer => {
  const server = new McpServer(
    {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
    },
    {
      // Enable task support with in-memory stores (experimental).
      // https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks
      capabilities: {
        resources: {
          subscribe: true,
          listChanged: true,
        },
        tasks: {
          list: {},
          cancel: {},
          requests: { tools: { call: {} } },
        },
      },
      taskStore: new InMemoryTaskStore(),
      taskMessageQueue: new InMemoryTaskMessageQueue(),
    },
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);
  registerApps(server);

  // Notify subscribed clients when todos change.
  todoEvents.on('change', ({ todoId }) => {
    server.server.sendResourceUpdated({ uri: `todos://detail/${todoId}` });
    server.sendResourceListChanged();
  });

  return server;
};
