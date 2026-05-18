import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it, vi } from 'vitest';
import { register } from './registry.js';

const mockServer = () => ({
  registerPrompt: vi.fn(),
});

describe('prompt registry', () => {
  it('registers a prompt with name, config, and callback', () => {
    const server = mockServer();
    const callback = vi.fn();
    register(server as unknown as McpServer, 'my-prompt', {
      title: 'My Prompt',
      description: 'Does prompting',
      callback,
    });

    expect(server.registerPrompt).toHaveBeenCalledOnce();
    const [name, config, cb] = server.registerPrompt.mock.calls[0];
    expect(name).toBe('my-prompt');
    expect(config.title).toBe('My Prompt');
    expect(config.description).toBe('Does prompting');
    expect(cb).toBeDefined();
  });

  it('includes argsSchema when provided', () => {
    const server = mockServer();
    register(server as unknown as McpServer, 'with-args', {
      title: 'Args Prompt',
      description: 'Has args',
      argsSchema: { type: 'object', properties: { topic: { type: 'string' } } },
      callback: vi.fn(),
    });

    const config = server.registerPrompt.mock.calls[0][1];
    expect(config.argsSchema).toBeDefined();
  });
});
