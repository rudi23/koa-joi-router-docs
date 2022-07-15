# koa-joi-router docs generator

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@rudi23/koa-joi-router-docs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@rudi23/koa-joi-router-docs
[download-image]: https://img.shields.io/npm/dm/@rudi23/koa-joi-router-docs.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/@rudi23/koa-joi-router-docs
[koa-joi-router]: https://github.com/koa-better-modules/joi-router
[swagger]: https://swagger.io

This project is based on [chuyik/koa-joi-router-docs](https://github.com/chuyik/koa-joi-router-docs).

A node module for generating [Swagger 2.0][swagger] JSON definitions from existing [koa-joi-router][] routes.

## Installation

Install using [`npm`][npm-url]:

```bash
npm install @rudi23/koa-joi-router-docs
```

NodeJS `>= 12.0.0.` is required.

## Example
Visit [example/](./example) folder to see the full example.

## API

#### `new SwaggerAPI()`
Creates a new SwaggerAPI instance.

#### `swaggerAPI.addJoiRouter(router, options)`

Add a joi-router instance to the API. The router should already have all its
routes set up before calling this method (which pulls the route definitions
from the router's `.routes` property).

Options:
- `prefix`: prefix to add to Swagger path (use prefix from JoiRouter if not set)

#### `swaggerAPI.generateSpec(baseSpec, options)`

Create a Swagger specification for this API. A base specification should be
provided with an `info` object (containing at least the `title` and `version`
strings) and any other global descriptions.

Options:
- `defaultResponses`: xustom default responses
  ```js
  {
    200: {
      description: 'Success'
    }
  }
  ```
