const webhookHandler = require('../utils/webhookHandler')
const whatsAppService = require('../services/whatsAppService')
const instagramService = require('../services/instagramService')
const { sendTextMessage, saveFileLocally } = require('../services/messageService')
const { handleQuickReply } = require('./quickReplyHandler')
const { saveMessage, handleAttachment } = require('../services/msg-save')

require('dotenv').config()

const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0



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
  console.log('debug level:', DEBUG_LEVEL)
  console.log('Webhook event received:', JSON.stringify(body, null, 2))
  let who

  try {
    if (body.object.startsWith('whatsapp')) {
      const entry = body.entry[0]
      const change = entry.changes[0]
      const message = change.value.messages[0]
      who = {
        sender_id: message.from,
        recipient_id: change.value.metadata.phone_number_id
      }
    } else if (body.object === 'page' || body.object === 'instagram') {
      const entry = body.entry[0]
      const messagingEvent = entry.messaging[0]
      who = {
        sender_id: messagingEvent.sender.id,
        recipient_id: messagingEvent.recipient.id
      }
    } else {
      reply.code(400).send('Unsupported platform')
      return
    }

    if (body.object.startsWith('whatsapp')) {
      if (body.entry && body.entry[0].changes[0].value.messages) {
        const messages = body.entry[0].changes[0].value.messages
        for (let message of messages) {
          if (DEBUG_LEVEL > 0) console.log('Received message: ', message)
          if (message.type !== 'text') {
            await handleAttachment('whatsapp', message)
          } else {
            await saveMessage('whatsapp', who, message, 'text')
          }
        }
      }
      reply.code(200).send('EVENT_RECEIVED')
    } else if (body.object === 'page') {
      await Promise.all(body.entry.map(async (entry) => {
        const messagingEvents = entry.messaging
        for (let event of messagingEvents) {
          if (event.message) {
            if (event.message.quick_reply) {
              if (DEBUG_LEVEL > 0) console.log('Quick reply received:', event.message.quick_reply)
              await exports.handleQuickReply(event)
            } else if (event.message.text) {
              if (DEBUG_LEVEL > 0) console.log('Message received:', event.message.text)
              await saveMessage('Facebook', who, event.message, 'text')
            } else if (event.message.attachments) {
              if (DEBUG_LEVEL > 0) console.log('Attachment received:', event.message.attachments)
              for (let attachment of event.message.attachments) {
                await handleAttachment('facebook', who, attachment, event.message)
              }
            }
          } else if (event.postback) {
            await webhookHandler.handlePostback(event)
          }
        }
      }))
      reply.code(200).send('EVENT_RECEIVED')
    } else if (body.object === 'whatsapp_business_account') {
      if (DEBUG_LEVEL > 0) console.log('WhatsApp Business Account event received:')
      await whatsAppService.getWhatsAppMessages(body)
      reply.code(200).send('EVENT_RECEIVED')
    } else if (body.object === 'instagram') {
      if (DEBUG_LEVEL > 0) console.log('Instagram event received:')
      await instagramService.getInstagramMessages(body, who)
      reply.code(200).send('EVENT_RECEIVED')
    } else {
      reply.code(404).send('Not Found')
    }
  } catch (error) {
    console.error('Error handling message:', error)
    reply.code(500).send('Error')
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