#!/usr/bin/env node

const SEPARATOR = '-----------------------------------';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const pathToRegexp = require('path-to-regexp');
const NamedRegExp = require('named-regexp-groups');

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
    const re = new NamedRegExp('^' + route.src);

    log.push('  http://localhost:' + argv.port + route.src + '  |  RegExp: ' + re.regex);
    
    app.all(re.regex, (req, res) => {
      console.log('=> "' + req.url + '" is matching ' + re.regex.toString());
      if (handlerExt === '.js') {
        req.url = req.url.replace(re, route.dest);
        require(handlerFilepath)(req, res);
        delete require.cache[require.resolve(handlerFilepath)];
      } else if(handlerExt !== '') {
        res.sendFile(handlerFilepath);
      } else {
        const match = req.url.match(re);
        var dest = route.dest;
        
        for (let i=1; i<match.length; i++) {
          dest = dest.replace('$' + i, match[i]);
        }
        if (match.groups) {
          Object.keys(match.groups).forEach(key => {
            dest = dest.replace('$' + key, match.groups[key]);
          });
        }
        res.sendFile(path.normalize(nowProjectDir + '/' + dest));
      }
    });
  });

  log.push(SEPARATOR);

  app.listen(argv.port);
  console.log(log.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}
