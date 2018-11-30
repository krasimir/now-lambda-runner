#!/usr/bin/env node

const SEPARATOR = '-----------------------------------';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

function error(msg) {
  console.log('\x1b[31m', msg);
  process.exit(1);
}

const argv = yargs
  .options({
    config: {
      type: 'string',
      default: path.normalize(process.cwd() + '/now.json'),
      desc: 'The path to now.json if it is missing in the current directory'
    },
    port: {
      type: 'number',
      default: 8004,
      desc: 'The port where the runner is listening for your requests'
    }
  })
  .help()
  .argv;

const nowConfPath = path.normalize(process.cwd() + '/' + argv.config);
const nowProjectDir = path.dirname(nowConfPath);

if (fs.existsSync(nowConfPath)) {
  const nowConf = require(nowConfPath);
  const express = require('express')
  const app = express();
  const successfulMessage = [SEPARATOR];

  nowConf.routes.forEach(route => {
    const handlerPath = (nowProjectDir + route.dest).split('?').shift();
    const handler = require(handlerPath);

    successfulMessage.push('http://localhost:' + argv.port + route.src);
    app.all(new RegExp(route.src), (req, res) => {
      handler(req, res);
    });
  });
  successfulMessage.push(SEPARATOR);

  app.listen(argv.port);
  console.log(successfulMessage.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}






