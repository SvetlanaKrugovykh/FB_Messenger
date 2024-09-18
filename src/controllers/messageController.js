const webhookHandler = require('../utils/webhookHandler')
require('dotenv').config()

exports.verifyWebhook = (req, reply) => {

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token === VERIFY_TOKEN) {
    console.log('Error verification webhook')
    reply.code(200).send(challenge)
  } else {
    console.log('Verification failed')
    reply.code(403).send('Verification failed')
  }
}

exports.handleMessage = async (req, reply) => {
  const body = req.body

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const messagingEvents = entry.messaging
      for (let event of messagingEvents) {
        if (event.message) {
          if (event.message.text) {
            await handleIncomingMessage(event)
          } else if (event.message.attachments) {
            await handleIncomingAttachment(event)
          }
        }
      }
    })

    reply.code(200).send('EVENT_RECEIVED')
  } else {
    reply.code(404).send('Not Found')
  }
}

exports.handleIncomingMessage = async (event) => {
  const senderId = event.sender.id
  const messageText = event.message.text

  console.log(`Sent message from ${senderId}: ${messageText}`)

  await sendTextMessage(senderId, `Your phrase is: "${messageText}"`)
}

exports.sendTextMessage = async (recipientId, text) => {
  const messageData = {
    recipient: { id: recipientId },
    message: { text },
  }

  try {
    await axios.post(FB_API_URL, messageData, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    })
    console.log(`Text message sent: "${text}" to user ${recipientId}`)
  } catch (error) {
    console.error('Error while message sending:', error.response ? error.response.data : error.message)
  }
}


exports.handleIncomingAttachment = async (event) => {
  const senderId = event.sender.id
  const attachments = event.message.attachments

  attachments.forEach(async (attachment) => {
    if (attachment.type === 'location') {
      const { coordinates } = attachment.payload
      console.log(`Location received ${senderId}:`, coordinates)

      await sendTextMessage(senderId, `Location received: ${coordinates.lat}, ${coordinates.long}`)
    }
  })
}