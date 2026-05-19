import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { register } from './registry.js';
import { analyzeTodosTaskConfig, analyzeTodosTaskHandler } from './todo/analyzeTodosTask.js';
import { breakdownTodoTool } from './todo/breakdownTodoTool.js';
import { deleteTodoTool } from './todo/deleteTodoTool.js';
import { importTodosTool } from './todo/importTodosTool.js';
import { upsertTodoTool } from './todo/upsertTodoTool.js';

export const registerTools = (server: McpServer) => {
  register(server, 'upsert-todo', upsertTodoTool);
  register(server, 'delete-todo', deleteTodoTool);
  register(server, 'breakdown-todo', breakdownTodoTool);
  register(server, 'import-todos', importTodosTool);

  // Task-based tool — uses the experimental tasks API directly.
  server.experimental.tasks.registerToolTask('analyze-todos', analyzeTodosTaskConfig, analyzeTodosTaskHandler);
};
