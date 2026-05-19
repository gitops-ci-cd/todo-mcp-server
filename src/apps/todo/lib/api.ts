import type { App } from '@modelcontextprotocol/ext-apps';
import type { Todo } from './types.js';

let _app: App;

export function setApp(app: App) {
  _app = app;
}

export async function fetchTodos(): Promise<Todo[]> {
  const list = await _app.listServerResources();
  const todoUris = list.resources.filter((r) => r.uri.startsWith('todos://detail/'));

  const todos: Todo[] = [];
  for (const { uri } of todoUris) {
    const result = await _app.readServerResource({ uri });
    const content = result.contents[0];
    if (content && 'text' in content) {
      try {
        const parsed = JSON.parse(content.text);
        if (parsed.data) todos.push(parsed.data as Todo);
      } catch {
        /* ignore */
      }
    }
  }
  return todos;
}

export async function saveTodo(data: {
  id?: string;
  title: string;
  completed?: boolean;
  description?: string;
}): Promise<void> {
  await _app.callServerTool({
    name: 'upsert-todo',
    arguments: {
      ...(data.id && { id: data.id }),
      title: data.title,
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.description && { description: data.description }),
    },
  });
}

export async function toggleTodo(todo: Todo): Promise<void> {
  await _app.callServerTool({
    name: 'upsert-todo',
    arguments: {
      id: todo.id,
      title: todo.title,
      completed: !todo.completed,
      ...(todo.description && { description: todo.description }),
    },
  });
}

export async function deleteTodo(id: string): Promise<void> {
  await _app.callServerTool({ name: 'delete-todo', arguments: { id } });
}
