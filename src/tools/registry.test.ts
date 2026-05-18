import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it, vi } from 'vitest';
import { register } from './registry.js';

const mockServer = () => ({
  registerTool: vi.fn(),
});

describe('tool registry', () => {
  it('registers a tool with name, config, and callback', () => {
    const server = mockServer();
    const callback = vi.fn();
    register(server as unknown as McpServer, 'my-tool', {
      title: 'My Tool',
      description: 'Does things',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
      callback,
    });

    expect(server.registerTool).toHaveBeenCalledOnce();
    const [name, config, cb] = server.registerTool.mock.calls[0];
    expect(name).toBe('my-tool');
    expect(config.title).toBe('My Tool');
    expect(config.description).toBe('Does things');
    expect(config.inputSchema).toBeDefined();
    expect(cb).toBeDefined();
  });

  it('includes annotations when provided', () => {
    const server = mockServer();
    register(server as unknown as McpServer, 'annotated', {
      title: 'Annotated',
      description: 'Has annotations',
      annotations: { readOnlyHint: true },
      inputSchema: {},
      callback: vi.fn(),
    });

    const config = server.registerTool.mock.calls[0][1];
    expect(config.annotations).toEqual({ readOnlyHint: true });
  });

  it('includes outputSchema when provided', () => {
    const server = mockServer();
    register(server as unknown as McpServer, 'with-output', {
      title: 'Output',
      description: 'Has output schema',
      inputSchema: {},
      outputSchema: { type: 'object' },
      callback: vi.fn(),
    });

    const config = server.registerTool.mock.calls[0][1];
    expect(config.outputSchema).toEqual({ type: 'object' });
  });
});
