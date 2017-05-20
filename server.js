const path = require('path')
const express = require('express')
const apidocMiddleWare = require('./middleware/apidoc')

const PORT = 8080
const app = express()

apidocMiddleWare(app)

app.listen(PORT, function (err) {
  if (err) {
    console.log(`server error: ${err.message}`)
  } else {
    console.log(`server listening: ${PORT}`)
  }
})