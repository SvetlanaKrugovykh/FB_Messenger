const webhookHandler = require('../utils/webhookHandler')
const whatsAppService = require('../services/whatsAppService')
const { sendTextMessage, saveFileLocally } = require('../services/messageService')
const { handleQuickReply } = require('./quickReplyHandler')
require('dotenv').config()

exports.verifyWebhook = (req, reply) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  console.log('Webhook verification:', mode, token, challenge)

  if (mode && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    reply.code(200).send(challenge)
    reply.type('text/plain').send(challenge)
  } else {
    console.log('Verification failed')
    reply.code(403).send('Verification failed')
  }
}

exports.handleMessage = async (req, reply) => {
  const body = req.body
  console.log('Webhook event received:', JSON.stringify(body, null, 2))

  if (body.object === 'page') {
    await Promise.all(body.entry.map(async (entry) => {
      const messagingEvents = entry.messaging
      for (let event of messagingEvents) {
        if (event.message) {
          if (event.message.quick_replies) {
            console.log('Quick reply received:', event.message.quick_replies)
            await exports.handleQuickReply(event)
          } else if (event.message.text) {
            console.log('Message received:', event.message.text)
            await exports.handleIncomingMessage(event)
          } else if (event.message.attachments) {
            console.log('Attachment received:', event.message.attachments)
            await exports.handleIncomingAttachment(event)
          }
        } else if (event.postback) {
          await webhookHandler.handlePostback(event)
        }
      }
    }))

    reply.code(200).send('EVENT_RECEIVED')

  } else if (body.object === 'whatsapp_business_account') {
    console.log('WhatsApp event received:')
    await whatsAppService.getWhatsAppMessages(body)
    reply.code(200).send('EVENT_RECEIVED')

  } else if (body.object === 'instagram') {
    console.log('Instagram event received:')
    await instagramService.getInstagramMessages(body)
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

exports.handleIncomingAttachment = async (event) => {
  const senderId = event.sender.id
  const attachments = event.message.attachments

  await Promise.all(attachments.map(async (attachment) => {
    switch (attachment.type) {
      case 'location': {
        const { coordinates } = attachment.payload
        console.log(`Location received ${senderId}:`, coordinates)
        await sendTextMessage(senderId, `Location received: ${coordinates.lat}, ${coordinates.long}`)
        break
      }

      case 'image': {
        const imageUrl = attachment.payload.url
        console.log(`Image received ${senderId}:`, imageUrl)
        await saveFileLocally(imageUrl, 'image')
        await sendTextMessage(senderId, `Image received: ${imageUrl}`)
        break
      }

      case 'video': {
        const videoUrl = attachment.payload.url
        console.log(`Video received ${senderId}:`, videoUrl)
        await saveFileLocally(videoUrl, 'video')
        await sendTextMessage(senderId, `Video received: ${videoUrl}`)
        break
      }

      case 'audio': {
        const audioUrl = attachment.payload.url
        console.log(`Audio received ${senderId}:`, audioUrl)
        await saveFileLocally(audioUrl, 'audio')
        await sendTextMessage(senderId, `Audio received: ${audioUrl}`)
        break
      }

      default: {
        console.log(`Unsupported attachment type ${attachment.type} received from ${senderId}`)
        await sendTextMessage(senderId, `Unsupported attachment type: ${attachment.type}`)
        break
      }
    }
  }))
}
exports.handleQuickReply = handleQuickReply