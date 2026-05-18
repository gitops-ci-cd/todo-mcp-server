# Todo MCP Server

A [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/introduction) showcasing MCP concepts via todos.

## Usage

### MCP Bundle (one-click)

Download the `.mcpb` file from the [latest release](https://github.com/gitops-ci-cd/todo-mcp-server/releases/latest) and open it — Claude Desktop will handle the rest.

### npm

```json
{
  "mcp": {
    "servers": {
      "todo-mcp-server": {
        "command": "npx",
        "args": ["-y", "--registry", "https://npm.pkg.github.com", "@gitops-ci-cd/todo-mcp-server", "stdio"]
      }
    }
  }
}
```

### Docker

```json
{
  "mcp": {
    "servers": {
      "todo-mcp-server": {
        "url": "http://localhost:8080/mcp",
        "type": "http"
      }
    }
  }
}
```

```sh
docker run -p 8080:8080 ghcr.io/gitops-ci-cd/todo-mcp-server
```

### Remote

```json
{
  "mcp": {
    "servers": {
      "todo-mcp-server": {
        "url": "https://ai.acme.com/mcp",
        "type": "http"
      }
    }
  }
}
```

## Development

### Starting the Server locally

```sh
cp .env.example .env
docker compose watch
```

If you have node installed locally, you can use:

```sh
npm run start
```

### Adding Tools

[Tools](https://modelcontextprotocol.io/docs/concepts/tools) are registered in the [./src/tools](./src/tools) directory.

### Adding Resources

[Resources & Templates](https://modelcontextprotocol.io/docs/concepts/resources) are registered in the [./src/resources](./src/resources) directory.

### Adding Apps

[Apps](https://modelcontextprotocol.io/extensions/apps/overview) are registered in the [./src/apps](./src/apps) directory.

### Adding Prompts

[Prompts](https://modelcontextprotocol.io/docs/concepts/prompts) are registered in the [./src/prompts](./src/prompts) directory.

### Debugging

To debug the server, you can use [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) which should be running at <http://localhost:6274/?serverUrl=http://app:8080/mcp> if you're using the provided Docker setup.

### Environment Variables

See [`.env.example`](./.env.example) for required and recommended environment variables.

## Releasing

Releases are triggered by pushing a semver tag:

```sh
npm version patch -m "v%s"    # or minor / major — bumps package.json, commits, tags
git tag -fa "v$(node -p "require('./package.json').version")" HEAD -m "v$(node -p "require('./package.json').version")"
git push --follow-tags
```

This kicks off the [release workflow](./.github/workflows/release.yaml).

### Distribution

| Channel | Transport | Identifier |
| --- | --- | --- |
| npm | stdio | `@gitops-ci-cd/todo-mcp-server` |
| GHCR | streamable-http | `ghcr.io/gitops-ci-cd/todo-mcp-server` |
| MCPB | stdio | [Latest release](https://github.com/gitops-ci-cd/todo-mcp-server/releases/latest) |
| Remote | streamable-http | See `server.json` |

Registry metadata is defined in [`server.json`](./server.json). To publish to the [MCP Registry](https://registry.modelcontextprotocol.io):

```sh
brew install mcp-publisher
mcp-publisher login github
mcp-publisher publish
```
