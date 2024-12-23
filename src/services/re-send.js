const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const GROUP_ID = process.env.GROUP_ID

module.exports.sendTelegram = async function (fileName, platform, sender_id) {
  try {
    const formData = new FormData()
    const fileStream = fs.createReadStream(fileName)
    const fileExtension = path.extname(fileName).toLowerCase()
    let telegramEndpoint
    let caption = `platform: ${platform}\nsender_id: ${sender_id}`

    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        telegramEndpoint = 'sendPhoto'
        formData.append('photo', fileStream, {
          filename: path.basename(fileName),
          contentType: `image/${fileExtension.slice(1)}`
        })
        break
      case '.mp3':
      case '.wav':
      case '.ogg':
        telegramEndpoint = 'sendAudio'
        formData.append('audio', fileStream, {
          filename: path.basename(fileName),
          contentType: `audio/${fileExtension.slice(1)}`
        })
        break
      case '.mp4':
        telegramEndpoint = 'sendVideo'
        formData.append('video', fileStream, {
          filename: path.basename(fileName),
          contentType: 'video/mp4'
        })
        break
      default:
        telegramEndpoint = 'sendDocument'
        formData.append('document', fileStream, {
          filename: path.basename(fileName),
          contentType: 'application/octet-stream'
        })
        break
    }

    formData.append('caption', caption)
    formData.append('chat_id', GROUP_ID)
    const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${telegramEndpoint}`, formData, {
      headers: formData.getHeaders()
    })
    console.log(response.data)
    await module.exports.sendButtonsToTelegram(platform, sender_id)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports.sendTxtMsgToTelegram = async function (message, platform, sender_id) {

  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: GROUP_ID,
      text: `platform: ${platform}\nsender_id: ${sender_id}\nmessage: ${message}\n`,
    }, { parse_mode: "HTML" })
    console.log('Message sent successfully')
    await module.exports.sendButtonsToTelegram(message, platform, sender_id)
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error.message)
    return false
  }
}


module.exports.sendButtonsToTelegram = async function (message, platform, sender_id) {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: GROUP_ID,
      text: message,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{
            text: `✅ platform: ${platform}\nsender_id: ${sender_id}`, callback_data: 'reply'
          }],
          [{ text: `❌ platform: ${platform}\nsender_id: ${sender_id}`, callback_data: 'decline' }],
        ],
      }),
    })
    console.log('Message sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error.message)
    return false
  }
}