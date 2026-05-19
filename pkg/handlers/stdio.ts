import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { initializeServer } from '../../src/server.js';

const transport = new StdioServerTransport();

const server = initializeServer();

await server.connect(transport);
