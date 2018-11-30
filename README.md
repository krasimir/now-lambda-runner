# now-lambda-runner

A tool for locally testing [now](https://zeit.co/now) lambdas.

Install the tool via

```
> npm install -g now-lambda-runner
```

Then go to the folder containing `now.json` and run

```
> now-lambda
```

You can also pass a path to the `now.json` file via the `--config` argument. For example:

```
> now-lambda --config ../path/to/app/folder/now.json
```

What happens when you run the command above is that there is an [expressjs](https://expressjs.com/) server running on your machine. It reads the `now.json` file and creates endpoints for the routes that you defined. When the route is hit in a browser it requires your lambda and passes the request to it. The server by default is running on port 8004. You can change that by passing a `--port` argument.