module.exports = {
  SWAGGER_VERSION: "2.0",
  DEFAULT_SCHEMES: [
    'http',
    'https'
  ],
  DEFAULT_CONSUMES: [
    'application/json',
    'application/x-www-form-urlencoded'
  ],
  DEFAULT_PRODUCES: [
    'application/json'  
  ],
  MONGOOSE_TYPE_MAPPING: {
    'string': { type: 'string' },
    'objectId': { type: 'string' },
    'number': { type: 'number',  format: 'float' },
    'date': { type: 'string', format: 'date-time' }
  },
  DEFAULT_RESPONSE: {
    "405": {
      "description": "Invalid input"
    },
    "200": {
      "description": "successful operation"
    }
  }
}