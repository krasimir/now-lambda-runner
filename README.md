# now-lambda-runner

A tool for locally testing [now](https://zeit.co/now) lambdas.

Install the tool via

```
> npm install -g now-lambda-runner
```

Let's say that we have the following `now.json` file:

```json
{
  "version": 2,
  "builds": [
    { "src": "www/*.js", "use": "@now/node" }
  ],
  "alias": [ "demoit.now.sh" ],
  "routes": [
    { "src": "/e/(.*)", "dest": "/www/editor.js?id=$1"},
    { "src": "/(.*)", "dest": "/www/index.js?path=$1"}
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
  http://localhost:8004/(.*)
-----------------------------------
```

You can also pass a path to the `now.json` file via the `--config` argument. For example:

```
> now-lambda --config ../path/to/app/folder/now.json
```

What happens when you run `now-lambda` is that there is an [expressjs](https://expressjs.com/) server running on your machine. It reads the `now.json` file and creates endpoints for the routes that you defined. When the route gets hit via browser it `require`s your lambda and passes the request to it. The server by default is running on port 8004. You can change that by passing a `--port` argument.