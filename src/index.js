const Fastify = require('fastify')
const botRoutes = require('./routes/botRoutes')
const fs = require('fs')
const path = require('path')

const credentials = {
  key: fs.readFileSync(path.resolve(__dirname, '../path/to/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../path/to/certificate.pem'))
}

const app = Fastify({
  trustProxy: true,
  https: credentials,
})

app.register(botRoutes)

module.exports = { app } 