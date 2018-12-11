#!/usr/bin/env node

const SEPARATOR = '-----------------------------------';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const pathToRegexp = require('path-to-regexp');
const NamedRegExp = require('named-regexp-groups');

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

function error(msg) {
  console.log('\x1b[31m', msg);
  process.exit(1);
}
function removeQuery(url) {
  return url.split('?').shift();
}

const nowConfPath = path.normalize(process.cwd() + '/' + argv.config);
const nowProjectDir = path.dirname(nowConfPath);

if (fs.existsSync(nowConfPath)) {
  const nowConf = require(nowConfPath);
  const express = require('express')
  const app = express();
  const log = [SEPARATOR, 'Routes:'];

  nowConf.routes.forEach(route => {
    const re = new NamedRegExp('^' + route.src);
    
    log.push('  http://localhost:' + argv.port + route.src + '  |  RegExp: ' + re.regex);
    
    app.all(re.regex, (req, res) => {
      const logMessage = '=> ' + req.url + ' is matching ' + route.src;
      const match = req.url.match(re);
      var dest = route.dest;
      
      for (let i=1; i<match.length; i++) {
        dest = dest.replace(new RegExp('\\$' + i, 'g'), match[i]);
      }
      if (match.groups) {
        Object.keys(match.groups).forEach(key => {
          dest = dest.replace(new RegExp('\\$' + key, 'g'), match.groups[key]);
        });
      }
      const handlerFilepath = path.normalize(nowProjectDir + '/' + removeQuery(dest));
      const handlerExt = path.extname(removeQuery(route.dest)).toLowerCase();

      if (handlerExt === '.js') {
        console.log(logMessage + ' --> ' + dest + ' (node)');
        req.url = dest;
        require(handlerFilepath)(req, res);
        delete require.cache[require.resolve(handlerFilepath)];
      } else {
        console.log(logMessage + ' --> ' + dest + ' (static)');
        res.sendFile(handlerFilepath);
      }
    });
  });

  log.push(SEPARATOR);

  app.listen(argv.port);
  console.log(log.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}
