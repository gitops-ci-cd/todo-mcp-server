import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { register } from './registry.js';
import { tipsTemplate } from './todo/tipsTemplate.js';
import { todosTemplate } from './todo/todosTemplate.js';

export const registerResources = (server: McpServer) => {
  register(server, 'todos', todosTemplate);
  register(server, 'todo-tips', tipsTemplate);
};
