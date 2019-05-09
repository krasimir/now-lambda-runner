# !!! Deprecated

Use `now dev` instead.

Here is a introductory [blog post](https://zeit.co/blog/now-dev). [Now docs](https://zeit.co/now).

## now-lambda-runner

A tool for locally testing [now](https://zeit.co/now) lambdas.

## Installation

Install the tool via

```
> npm install -g now-lambda-runner
```

## Usage

Let's say that we have the following `now.json` file:

```json
{
  "version": 2,
  "builds": [
    { "src": "static/assets/**/*.*", "use": "@now/static" },
    { "src": "static/assets/*.*", "use": "@now/static" },
    { "src": "static/*.*", "use": "@now/static" },
    { "src": "api/*.js", "use": "@now/node" },
    { "src": "*.js", "use": "@now/node" },
    { "src": "*.html", "use": "@now/static" }
  ],
  "routes": [
    { "src": "/api/login", "dest": "/api/login.js" },
    { "src": "/api/demo", "dest": "/api/demo.js" },
    { "src": "/static/assets/(.*)", "dest": "/static/assets/$1"},
    { "src": "/static/(.*)", "dest": "/static/$1"},
    { "src": "/e/resources/(?<resource>[^/]*)", "dest": "/static/resources/$resource"},
    { "src": "/e/(.*)?", "dest": "/editor.js?id=$1"},
    { "src": "/docs", "dest": "/docs.html"},
    { "src": "/(.*)", "dest": "/index.html"}
  ]
}
```

We have to go to the folder containing that `now.json` file and run

```
> now-lambda
```

The result is as follows:

```
-----------------------------------
Routes:
  http://localhost:8004/api/login
  http://localhost:8004/api/demo
  http://localhost:8004/static/assets/(.*)
  http://localhost:8004/static/(.*)
  http://localhost:8004/e/resources/(?<resource>[^/]*)
  http://localhost:8004/e/(.*)?
  http://localhost:8004/docs
  http://localhost:8004/(.*)
-----------------------------------
```

And if we run the following curl request:

```
curl -i http://localhost:8004/e/foobar
```

we get `editor.js` lambda executed. The server reports:

```
=> /e/foobar === /e/(.*)?
   @now/node("/editor.js?id=foobar")
```

Here's is a list of the things that happen when `now-lambda` process your `now.json` file:

* It spins up a [node](https://nodejs.org/api/http.html) server locally on your machine
* It starts reading the `routes` field in the `now.json` file and defines route handlers for each of the routes.
* When a route matches it reads the `builds` field to figure out if it has to server statically the file or it must run the lambda.
* The module only understands `@now/static`, `@now/node` and `@now/static-build` (partly). If there is another builder used the file is considered a static resource and it gets served directly.

`now-lambda` does not:
* Use the real now builders
* Does not connect to now's servers

## CLI arguments

* `--config` - path to `now.json` file
* `--port` - by default the local server listens on port 8004. You can change it via this argument.