const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { insertMessage } = require('../db/requests')
const { sendTelegram, sendTxtMsgToTelegram } = require('../services/re-send')
require('dotenv').config()

const DOWNLOAD_APP_PATH = process.env.DOWNLOAD_APP_PATH
const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0

module.exports.saveMessage = async function (platform, who, message, messageType, attachmentType = null, attachmentUrl = null, attachmentFilename = null) {

  let messageId

  if (platform === 'whatsapp') {
    messageId = message.id
  } else {
    messageId = message.mid
  }

  const data = {
    platform,
    sender_id: who.sender_id,
    recipient_id: who.recipient_id,
    received_at: new Date(),
    message_id: messageId,
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
      await sendTxtMsgToTelegram(message.text, platform, who.sender_id)
    }
  } catch (error) {
    console.error(`Failed to save message: ${error.message}`)
  }
}

module.exports.handleAttachment = async function (platform, who, attachment, message) {
  let TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  if (platform === 'whatsapp') {
    TOKEN = process.env.WHATSAPP_TOKEN
  } else if (platform === 'Instagram') {
    TOKEN = process.env.INSTAGRAM_TOKEN
  }
  const url = attachment.payload.url
  const fileExtension = path.extname(url.split('?')[0])
  const uniqueFilename = `${uuidv4()}${fileExtension}`
  const filepath = path.join(DOWNLOAD_APP_PATH, uniqueFilename)
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    })
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath)
      response.data.pipe(writer)
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    if (DEBUG_LEVEL > 0) console.log(`Attachment saved: ${filepath}`)
    await module.exports.saveMessage(platform, who, message, 'attachment', attachment.type, url, uniqueFilename)
    await sendTelegram(filepath, platform, who.sender_id)
  } catch (error) {
    if (DEBUG_LEVEL > 0) console.error(`Failed to download attachment: ${error.message}`)
  }
}
