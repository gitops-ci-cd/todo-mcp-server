#!/usr/bin/env node

process.on('uncaughtException', (err) => console.error('Uncaught:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('SIGTERM', () => console.error('Received SIGTERM'));
process.on('SIGINT', () => console.error('Received SIGINT'));
process.on('exit', (code) => console.error(`Process exiting with code: ${code}`));

const transport = process.argv[2] ?? 'http';

try {
  if (transport === 'stdio') {
    await import('./handlers/stdio.js');
  } else {
    const { app, port } = await import('./app.js');
    app.listen(port, () => {
      console.info(`Server is running on port ${port}`);
    });
  }
} catch (err) {
  console.error('Fatal:', err);
  process.exit(1);
}
