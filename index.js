#!/usr/bin/env node

const SEPARATOR = '-----------------------------------';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const url = require('url');

function error(msg) {
  console.log('\x1b[31m', msg);
  process.exit(1);
}
function resolveParams(originalURL, pattern, dest) {
  const matches = originalURL.match(pattern);
  const parsed = url.parse(dest, true);
  
  return Object.keys(parsed.query).reduce((params, keyName) => {
    const placeholder = parsed.query[keyName].match(/\$(\d+)/);
    if (placeholder) {
      params[keyName] = matches[Number(placeholder[1])];
    } else {
      params[keyName] = parsed.query[keyName];
    }
    return params;
  }, {})
}

const argv = yargs
  .options({
    config: {
      type: 'string',
      default: 'now.json',
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
    const handlerPath = route.dest.split('?').shift();
    const r = new RegExp(route.src);
    
    successfulMessage.push('http://localhost:' + argv.port + route.src);
    app.all(r, (req, res) => {
      const handler = require(nowProjectDir + handlerPath);

      req.url = url.format({
        pathname: handlerPath,
        query: resolveParams(req.url, r, route.dest)
      });
      handler(req, res);
      delete require.cache[require.resolve(nowProjectDir + handlerPath)]
    });
  });
  successfulMessage.push(SEPARATOR);

  app.listen(argv.port);
  console.log(successfulMessage.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}
