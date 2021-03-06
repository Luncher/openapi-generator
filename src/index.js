const fs = require('fs-extra')
const urllib = require('urllib')
const assert = require('assert')
const express = require('express')
const poplar = require('poplar')
const config = require('./config')
const debug = require('debug')('openapi:index')
const SWaggerGenerator = require('./generator')
const PoplarAdapter = require('./adapter/poplar')

function validateSpec (spec, cb) {
  urllib.request(config.OPENAPI_VALIDATE_URL, {
    method: 'POST',
    data: spec,
    timeout: 60000,
    dataType: 'json', 
    headers: {
      'Content-Type': 'application/json'
    },
  }, function (err, data, res) {
    if (err) {
      cb(err)
    } else if (data && data.schemaValidationMessages) {
      cb(new Error(data.schemaValidationMessages[0].message))
    } else {
      cb(null, spec)
    }
  })
}

exports.parsePoplar = function (APIRouter, options, cb) {
  const defaultOptions = {
    type: 'json',
    version: 'v2',
    host: '127.0.0.1',
    title: 'The poplar openapi title',
    description: 'The poplar openapi description',
  }
  assert(APIRouter instanceof poplar, 'APIRouter must be instanceof poplar')
  options = Object.assign(defaultOptions, options)
  
  const generator = new SWaggerGenerator(options)
  const adapter = new PoplarAdapter({ APIRouter })
  const spec = generator.generate(adapter)
  if (options.type === 'yaml') {
    debug('if generate yaml then skip validate because of remote server BUG')
    fs.writeFileSync('poplar-test.yaml', spec)
    return process.nextTick(cb, null, spec)
  } else {
    fs.outputJsonSync('poplar-test.json', spec)
    return validateSpec(spec, cb)   
  }
}

exports.parseFeathers = function (app, options) {
  //TODO
}