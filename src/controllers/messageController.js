const webhookHandler = require('../utils/webhookHandler')
require('dotenv').config()

exports.verifyWebhook = (req, reply) => {


  //const VERIFY_TOKEN = process.env.VERIFY_TOKEN
  const VERIFY_TOKEN = 'test-silv-srv-2024'
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token === VERIFY_TOKEN) {
    console.log('Вебхук успешно подтверждён')
    reply.code(200).send(challenge)
  } else {
    console.log('Ошибка подтверждения вебхука')
    reply.code(403).send('Verification failed')
  }
}

exports.handleMessage = async (req, reply) => {
  const body = req.body

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0]
      console.log('Получено событие: ', event)

      await webhookHandler.processEvent(event)
    })

    reply.code(200).send('EVENT_RECEIVED')
  } else {
    reply.code(404).send('Not Found')
  }
}
