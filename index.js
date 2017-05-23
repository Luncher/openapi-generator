const debug = require('debug')('swagger-test:index')
const express = require('express')
const app = express()
const apiRouter = require('./api/api_routes')

const PORT = 3008

app.use(apiRouter.v1.rest)

app.set('port', PORT)
app.listen(PORT, err => {
  if (err) {
    console.log(`app listen error: ${err.message}`)
  } else {
    console.log(`app listen on port : ${PORT}`)
  }
})
