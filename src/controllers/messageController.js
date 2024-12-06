const webhookHandler = require('../utils/webhookHandler')
const whatsAppService = require('../services/whatsAppService')
const { sendTextMessage, saveFileLocally } = require('../services/messageService')
const { handleQuickReply } = require('./quickReplyHandler')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const { insertMessage } = require('../db/requests')
const { sendTelegram, sendTxtMsgToTelegram } = require('../services/re-send')

const DOWNLOAD_APP_PATH = process.env.DOWNLOAD_APP_PATH
const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0

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
  if (DEBUG_LEVEL > 0) console.log('Webhook event received:', JSON.stringify(body, null, 2))
  const who = {
    sender_id: body.entry[0].messaging[0].sender.id,
    recipient_id: body.entry[0].messaging[0].recipient.id
  }

  if (body.object === 'whatsapp') {
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
            await saveMessage('facebook', who, event.message, 'text')
          } else if (event.message.attachments) {
            if (DEBUG_LEVEL > 0) console.log('Attachment received:', event.message.attachments)
            for (let attachment of event.message.attachments) {
              await handleAttachment('facebook', attachment, event.message)
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
    await instagramService.getInstagramMessages(body)
    reply.code(200).send('EVENT_RECEIVED')
  } else {
    reply.code(404).send('Not Found')
  }
}

const handleAttachment = async (platform, attachment, message) => {
  const url = attachment.payload.url
  const uniqueFilename = `${uuidv4()}${path.extname(url)}`
  const filepath = path.join(DOWNLOAD_APP_PATH, uniqueFilename)
  try {
    const response = await axios.get(url, { responseType: 'stream' })
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath)
      response.data.pipe(writer)
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    if (DEBUG_LEVEL > 0) console.log(`Attachment saved: ${filepath}`)
    await saveMessage(platform, who, message, 'attachment', attachment.type, url, uniqueFilename)
    await sendTelegram(process.env.TELEGRAM_CHAT_ID, filepath)
  } catch (error) {
    if (DEBUG_LEVEL > 0) console.error(`Failed to download attachment: ${error.message}`)
  }
}

const saveMessage = async (platform, who, message, messageType, attachmentType = null, attachmentUrl = null, attachmentFilename = null) => {
  const data = {
    platform,
    sender_id: who.sender_id,
    recipient_id: who.recipient_id,
    received_at: new Date(),
    message_id: message.mid,
    message_text: message.text || null,
    message_type: messageType,
    attachment_type: attachmentType,
    attachment_url: attachmentUrl,
    attachment_filename: attachmentFilename,
    status: 'new'
  }

  try {
    const result = await insertMessage(data)
    if (DEBUG_LEVEL > 0) console.log(`Message saved with ID: ${result?.id}`)

    if (messageType === 'text') {
      await sendTxtMsgToTelegram(message.text)
    }
  } catch (error) {
    console.error(`Failed to save message: ${error.message}`)
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