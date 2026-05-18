import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it, vi } from 'vitest';
import { register } from './registry.js';

const mockServer = () => ({
  registerResource: vi.fn(),
});

describe('resource registry', () => {
  it('registers a static resource with uri', () => {
    const server = mockServer();
    const readCallback = vi.fn();
    register(server as unknown as McpServer, 'my-resource', {
      title: 'My Resource',
      uri: 'todo://config',
      metadata: { mimeType: 'application/json' },
      readCallback,
    });

    expect(server.registerResource).toHaveBeenCalledOnce();
    const [name, uri, config, cb] = server.registerResource.mock.calls[0];
    expect(name).toBe('my-resource');
    expect(uri).toBe('todo://config');
    expect(config.title).toBe('My Resource');
    expect(cb).toBe(readCallback);
  });

  it('registers a resource template', () => {
    const server = mockServer();
    const template = new ResourceTemplate('todo://todos/{id}', { list: undefined });
    const readCallback = vi.fn();
    register(server as unknown as McpServer, 'todo-template', {
      title: 'Todo Template',
      resourceTemplate: template,
      metadata: { mimeType: 'application/json' },
      readCallback,
    });

    expect(server.registerResource).toHaveBeenCalledOnce();
    const [name, tmpl] = server.registerResource.mock.calls[0];
    expect(name).toBe('todo-template');
    expect(tmpl).toBe(template);
  });
});
