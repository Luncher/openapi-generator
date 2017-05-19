# openapi generator

openapi([swagger](http://swagger.io/)) spec generator

There are usually two ways to generate openapi spec `top-down approach`and` bottom-up approach`, ref [Getting Started](http://swagger.io/getting-started/) the `top-down` is too cumbersome
. For an existing project I use the `bottom-up` approach.


## mainly through the following steps

- 1. Define a skeleton according to the openapi [specification](http://swagger.io/specification/) for generate spec.
- 2. Design adapters to fit common frames such as express, koa etc.
- 3. Using swagger-codegen generate server and client code stub.
- 4. Using swagger-ui generate api document.


## License

[MIT License](https://opensource.org/licenses/mit-license.php)
