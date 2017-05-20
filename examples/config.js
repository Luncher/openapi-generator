const path = require('path')

module.exports = {
  openapi: {
    cache: 60 * 60 * 24 * 30,
    staticsPrefix: '/apidoc',
    staticsDir: path.resolve(__dirname, 'public'),
    staticTemplateIndex: 'index.template.html'
  }
}