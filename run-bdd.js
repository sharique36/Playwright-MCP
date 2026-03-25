// run-bdd.js
// Usage: node run-bdd.js [headless|headed]

const { exec } = require('child_process');

const mode = process.argv[2] === 'headed' ? 'false' : 'true';
const env = { ...process.env, HEADLESS: mode };

const command = 'npx cucumber-js';
const child = exec(command, { env });

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('close', (code) => {
  process.exit(code);
});
