#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const pkg = require('./package.json');

function error(msg) {
  console.log('\x1b[31m', msg);
  process.exit(1);
}

program
  .version(pkg.version)
  .option('-c', '--config', 'The path to now.json if it is missing in the current directory')
  .parse(process.argv);

console.log(program.config);
const nowConfPath = program.config || path.normalize(process.cwd() + '/now.json');

if (fs.existsSync(nowConfPath)) {
  const nowConf = require(nowConfPath);

  console.log(nowConf);
} else {
  error('now.json can not be found in ' + nowConfPath);
}






