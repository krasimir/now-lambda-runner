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
  const log = [SEPARATOR, 'Routes:'];

  nowConf.routes.forEach(route => {
    const destFilePath = route.dest.split('?').shift();
    const handlerFilepath = nowProjectDir + destFilePath;
    const handlerExt = path.extname(handlerFilepath).toLowerCase();
    const r = new RegExp(route.src);

    log.push('  http://localhost:' + argv.port + route.src);
    
    app.all(r, (req, res) => {
      if (handlerExt === '.js') {
        req.url = req.url.replace(r, route.dest);
        require(handlerFilepath)(req, res);
        delete require.cache[require.resolve(handlerFilepath)];
      } else if(handlerExt !== '') {
        res.sendFile(handlerFilepath);
      } else {
        res.sendFile(
          path.normalize(nowProjectDir + '/' + req.url.replace(r, route.dest))
        );
      }
    });
  });

  log.push(SEPARATOR);

  app.listen(argv.port);
  console.log(log.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}
