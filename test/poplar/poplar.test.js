const fs = require('fs-extra')
const assert = require('assert')
const APIRouter = require('./api/api_routes').v1
const parsePoplar = require('../../src/index').parsePoplar

describe('poplar openapi adapter test', function () {
  const options = {
    type: 'json',
    version: 'v2',
    host: '127.0.0.1',
    title: 'The poplar api title',
    description: 'The poplar openapi description',
  }

  it('show allow parsePoplar json', function (next) {
    parsePoplar(APIRouter, options, function (err, spec) {
      next(err)
    })
  })

  it('show allow parsePoplar yaml', function (next) {
    parsePoplar(APIRouter, Object.assign({}, options, {type: 'yaml'}), function (err, spec) {
      next(err)
    })
  })
})