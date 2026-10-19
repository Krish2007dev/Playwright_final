#!/usr/bin/env node
const glob = require('glob');
const { execFileSync } = require('child_process');
const path = require('path');

const files = glob.sync('tests/**/*.feature');

if (files.length === 0) {
  console.log('⚠️  No feature files found.');
  process.exit(0);
}

try {
  const gherkinLint = path.resolve(
    __dirname,
    'node_modules',
    'gherkin-lint',
    'dist',
    'main.js'
  );
  execFileSync(process.execPath, [gherkinLint, ...files], { stdio: 'inherit' });
} catch (error) {
  console.error('Gherkin lint failed:', error.message);
  process.exit(1);
}
