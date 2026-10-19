#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const generatedPaths = ['reports', '.features-gen'];

for (const relativePath of generatedPaths) {
  const targetPath = path.resolve(__dirname, relativePath);
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed ${relativePath}`);
  }
}

console.log('Generated reports and BDD files cleaned.');
