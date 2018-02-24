#!/usr/bin/env node
/* eslint no-console:0, no-process-env:0, no-process-exit:0 */
'use strict';

const { fork } = require('child_process');
const { spawn } = require('child_process');
const { join } = require('path');

console.log('Starting server');
let server = fork(join(__dirname, '..', 'examples', 'bridge.js'));
console.log('Server PID is ' + server.pid);

server.once('error', error => {
  console.error('Failed to start server: ' + error.stack);
  exit(error.code);
});

server.once('exit', code => {
  if (code) {
    console.error('Server closed in error');
    exit(code);
  }
});

console.log('Starting Karma');
let karma = spawn(join(__dirname, '..', 'node_modules', '.bin', 'karma'), ['start'], {
  env: Object.assign({
    FILE: join(__dirname, '..', 'examples', 'peer.js'),
  }, process.env),
  shell: true,
  stdio: 'inherit'
});
console.log('Karma PID is ' + karma.pid);

karma.once('error', error => {
  console.error('Failed to start Karma: ' + error.stack);
  exit(1);
});

karma.once('exit', code => {
  if (code) {
    console.error('Karma closed in error');
    exit(code);
  } else {
    console.log('Karma succeeded');
    exit(0);
  }
});

process.once('exit', exit);
process.once('SIGINT', exit);
process.once('SIGUSR1', exit);
process.once('SIGUSR2', exit);
process.once('uncaughtException', exit);

function exit(code) {
  if (server) {
    server.kill();
    server = null;
  }

  if (karma) {
    karma.kill();
    karma = null;
  }

  process.exit(code);
}
