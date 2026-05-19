// In-memory per-session store for Todos.

import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';

// --- Domain types ---

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
}

// --- Change events ---

export type TodoChangeEvent = {
  sessionId: string;
  todoId: string;
  action: 'upsert' | 'delete';
};

export const todoEvents = new EventEmitter<{ change: [TodoChangeEvent] }>();

// --- Session store ---

const sessions = new Map<string, Map<string, Todo>>();

const getStore = (sessionId: string): Map<string, Todo> => {
  let store = sessions.get(sessionId);
  if (!store) {
    store = new Map();
    sessions.set(sessionId, store);
  }
  return store;
};

export const destroySession = (sessionId: string): void => {
  sessions.delete(sessionId);
};

// --- Domain methods ---

export const listTodos = (sessionId: string, filter?: string): Todo[] => {
  const store = getStore(sessionId);
  let todos = [...store.values()];
  if (filter) {
    const lower = filter.toLowerCase();
    todos = todos.filter((t) => t.title.toLowerCase().includes(lower) || t.description?.toLowerCase().includes(lower));
  }
  return todos;
};

export const readTodo = (sessionId: string, id: string): Todo | undefined => {
  return getStore(sessionId).get(id);
};

export const upsertTodo = (
  sessionId: string,
  todo: { id?: string; title: string; completed?: boolean; description?: string },
): Todo => {
  const store = getStore(sessionId);
  const id = todo.id ?? randomUUID();
  const existing = store.get(id);

  const record: Todo = {
    id,
    title: todo.title,
    completed: todo.completed ?? existing?.completed ?? false,
    description: todo.description,
  };

  store.set(id, record);
  todoEvents.emit('change', { sessionId, todoId: id, action: 'upsert' });
  return record;
};

export const deleteTodo = (sessionId: string, id: string): boolean => {
  const deleted = getStore(sessionId).delete(id);
  if (deleted) {
    todoEvents.emit('change', { sessionId, todoId: id, action: 'delete' });
  }
  return deleted;
};
