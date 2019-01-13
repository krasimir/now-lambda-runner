#!/usr/bin/env node

const SEPARATOR = '-----------------------------------';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const NamedRegExp = require('named-regexp-groups');
const cors = require('cors');
const extglob = require('extglob');

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
  const getBuilder = dest => nowConf.builds.find(build => extglob.isMatch(dest, '?(/)' + build.src));

  nowConf.routes.forEach(route => {
    const re = new NamedRegExp('^' + route.src);

    const callback = (req, res) => {
      var logMessage = [`=>  ${req.method} - ${req.url} === ${route.src}`];
      const urlParts = req.url.split('?');
      const onlyPath = urlParts[0];
      const getParams = urlParts[1];
      const match = onlyPath.match(re);
      var dest = route.dest;

      for (let i = 1; i < match.length; i++) {
        dest = dest.replace(new RegExp('\\$' + i, 'g'), match[i]);
      }
      if (match.groups) {
        Object.keys(match.groups).forEach(key => {
          dest = dest.replace(new RegExp('\\$' + key, 'g'), match.groups[key]);
        });
      }
      const handlerFilepath = path.normalize(nowProjectDir + '/' + removeQuery(dest));
      const builder = getBuilder(removeQuery(dest));

      logMessage.push('   ' + (builder ? builder.use + '("' + dest + '")' : 'no builder found'));

      if (builder && builder.use === '@now/static') {
        console.log(logMessage.join('\n'));
        res.sendFile(handlerFilepath);
      } else if (builder && builder.use === '@now/node') {
        console.log(logMessage.join('\n'));
        req.url = dest + (getParams ? '?' + getParams : '');
        require(handlerFilepath)(req, res);
        delete require.cache[require.resolve(handlerFilepath)];
      } else if (fs.existsSync(handlerFilepath)) {
        console.log(logMessage.join('\n'));
        res.sendFile(handlerFilepath);
      } else {
        res.status(404);
        res.send(handlerFilepath + ' can not be found.');
      }
    };

    if (route.methods) {
      for (const method of route.methods) {
        log.push(` ${method} - http://localhost:${argv.port}${route.src}`);
        app[method.toLowerCase()](re.regex, cors(), callback);
      }
    } else {
      log.push(` ALL - http://localhost:${argv.port}${route.src}`);
      app.all(re.regex, cors(), callback);
    }
  });

  log.push(SEPARATOR);

  app.listen(argv.port);
  console.log(log.join('\n'));
} else {
  error('now.json can not be found in ' + nowConfPath);
}
