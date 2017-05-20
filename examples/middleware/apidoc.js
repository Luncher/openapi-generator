const fs = require('fs')
const path = require('path')
const express = require('express')
const serialize = require('serialize-javascript')
const config = require('../config')

const templateFile = path.join(config.openapi.staticsDir, config.openapi.staticTemplateIndex)
const targetFile = path.join(config.openapi.staticsDir, config.openapi.staticIndex || 'index.html')

function openAPIInit() {
  // Init apidoc system
  const ui = SwaggerUIBundle({
    url: "poplar-test-spec.json",
    dom_id: '#swagger-ui',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  })
  window.ui = ui
}

function resolveIndexHTML () {
  const contentMarker = '<!-- CONFIGURE -->'
  const template = fs.readFileSync(templateFile)
  const i = template.indexOf(contentMarker)
  const content = {
    head: template.slice(0, i),
    tail: template.slice(i + contentMarker.length)
  }
  const configTemplate = `<script> window.onload = ${serialize(openAPIInit)} </script>`
  fs.writeFileSync(targetFile, content.head)
  fs.appendFileSync(targetFile, configTemplate)  
  fs.appendFileSync(targetFile, content.tail)  
}

module.exports = function (app) {
  resolveIndexHTML()
  app.use(config.openapi.staticsPrefix, 
    express.static(config.openapi.staticsDir, 
      { cache: config.openapi.cache }))
}