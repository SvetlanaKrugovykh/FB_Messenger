const axios = require('axios')
require('dotenv').config()

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const FB_API_URL = 'https://graph.facebook.com/v11.0/me/messages'

exports.sendTextMessage = async (recipientId, text) => {
  const messageData = {
    recipient: { id: recipientId },
    message: { text },
  }

  try {
    await axios.post(FB_API_URL, messageData, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    })
    console.log(`Текстовое сообщение отправлено: "${text}" пользователю ${recipientId}`)
  } catch (error) {
    console.error('Ошибка при отправке текстового сообщения:', error.response ? error.response.data : error.message)
  }
}

exports.sendButtonMessage = async (recipientId, text, buttons) => {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text,
          buttons,
        },
      },
    },
  }

  try {
    await axios.post(FB_API_URL, messageData, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    })
    console.log(`Сообщение с кнопками отправлено пользователю ${recipientId}`)
  } catch (error) {
    console.error('Ошибка при отправке сообщения с кнопками:', error.response ? error.response.data : error.message)
  }
}
