'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function build() {
  const output = path.join(__dirname, 'dist');
  await fs.mkdir(output, { recursive: true });
  for (const file of ['index.html', 'style.css']) {
    await fs.copyFile(path.join(__dirname, file), path.join(output, file));
  }
  await fs.cp(path.join(__dirname, 'assets'), path.join(output, 'assets'), { recursive: true });
  console.log('Static website built in dist/');
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
