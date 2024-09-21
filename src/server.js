// server.js
require('dotenv').config()
const { app } = require('./index')
const HOST = process.env.HOST || '127.0.0.1'
const PORT = Number(process.env.PORT) || 9579

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`[APP] Service listening on ${address} | ${new Date()}`)
})