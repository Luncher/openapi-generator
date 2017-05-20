# openapi generator

[![Build Status][travis-image]][travis-url]
[![Codecov Status][codecov-image]][codecov-url]
[![David Status][david-image]][david-url]

[david-url]: https://david-dm.org/Luncher/openapi-generator
[david-image]: https://david-dm.org/Luncher/openapi-generator.svg?style=flat
[travis-url]: https://travis-ci.org/Luncher/openapi-generator
[travis-image]: https://img.shields.io/travis/Luncher/openapi-generator.svg?style=flat
[codecov-url]: https://codecov.io/gh/Luncher/openapi-generator
[codecov-image]: https://img.shields.io/codecov/c/github/Luncher/openapi-generator.svg?style=flat

openapi([swagger](http://swagger.io/)) spec generator

There are usually two ways to generate openapi spec `top-down approach`and` bottom-up approach`, ref [Getting Started](http://swagger.io/getting-started/) the `top-down` is too cumbersome
. For an existing project I use the `bottom-up` approach. 

>Usually everyone's application is not the same, but some things are similar, such as checking the input parameters, return to the client format fixed data content. I try to make the user only need to change the amount of code can be openapi related functions into existing applications.

---

## mainly through the following steps

- 1. Define a skeleton according to the openapi [specification](http://swagger.io/specification/) for generate spec.
- 2. Design adapters to fit common frames such as express, koa etc.
- 3. Using swagger-codegen generate server and client code stub.
- 4. Using swagger-ui generate api document.

---

## How to use

+ 1. Clone this registry

+ 2. Refer to the `src/adapter` folder to implement your own adapter

+ 3. Refer to the `examples` folder to learn how to integrate into the application

---

## Todo List

[ ] 1. Server and client code stub generate
[ ] 2. Implement `feathersjs` adapter
[ ] 3. Design a DSL to implement third-party adapters


## License

[MIT License](https://opensource.org/licenses/mit-license.php)
