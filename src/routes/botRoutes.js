const messageController = require('../controllers/messageController')

module.exports = (fastify, _opts, done) => {
  fastify.route({
    method: 'GET',
    url: '/webhook',
    handler: messageController.verifyWebhook,
  })

  fastify.route({
    method: 'POST',
    url: '/webhook',
    handler: messageController.handleMessage,
  })

  done()
}
