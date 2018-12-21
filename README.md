# now-lambda-runner

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
    { "src": "www/*.js", "use": "@now/node" },
    { "src": "www/index.html", "use": "@now/static" },
    { "src": "www/static/*.*", "use": "@now/static" }
  ],
  "alias": [ "demoit.now.sh" ],
  "routes": [
    { "src": "/e/(.*)", "dest": "/www/editor.js?id=$1"},
    { "src": "/static/(.*)", "dest": "/www/static/$1"},
    { "src": "/(.*)", "dest": "/www/index.html"}
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
  http://localhost:8004/e/(.*)
  http://localhost:8004/static/(.*)
  http://localhost:8004/(.*)
-----------------------------------
```

Here's is a list of the things that happen when `now-lambda` process your `now.json` file:

* It spins up an [expressjs](https://expressjs.com/) server locally on your machine
* It starts reading the `routes` field in the `now.json` file
* If the `dest` points to a JavaScript file it passes the request and response objects to the function exported by that file. Or in other words simulates now's lambda functions.
* If the `dest` points to a non JavaScript file it simply serves that file as a static resource.
* If the `dest` points to something else it assumes that this is a static resource and directly serves the content of the requested resource.

`now-lambda` does not:
* Read the `builds` field
* Does not use any of the `@now/<...>` packages
* Does not connect to now's servers

## Caveats

* `now-lambda` is a very light abstraction on top of Express. It is possible that some of the route matching works in a different way.
* `now-lambda` sends Express's `request` and `response` objects. In reality when you deploy your app those objects are provided by Node's [http](https://nodejs.org/api/http.html) module. For example `req.send` will not work when you deploy to Zeit because `.send` is not a method of [http](https://nodejs.org/api/http.html).

## CLI arguments

* `--config` - path to `now.json` file
* `--port` - by default the local server listens on port 8004. You can change it via this argument.