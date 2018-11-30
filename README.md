# now-lambda-runner

A tool for locally testing [now](https://zeit.co/now) lambdas.

Install the tool via

```
> npm install -g now-lambda-runner
```

Then go the folder containing `now.json` and run

```
> now-lambda
```

You can also pass a path to the `now.json` file via the `--config` argument. For example:

```
> now-lambda --config ../path/to/app/folder/now.json
```
