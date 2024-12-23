const axios = require('axios')
require('dotenv').config()

const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
const API_VERSION = process.env.API_VERSION
const FB_API_URL = `https://graph.facebook.com/${process.env.API_VERSION}/me/messages?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`

exports.sendTextMessage = async (recipientId, text) => {
  const messageData = {
    recipient: { id: recipientId },
    message: { text },
  }

  try {
    console.log('sendTextMessage', FB_API_URL)
    await axios.post(FB_API_URL, messageData)
    console.log(`Text message sent: "${text}" to user ${recipientId}`)
  } catch (error) {
    console.error('Error while message sending:', error.response ? error.response.data : error.message)
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
    console.log('sendButtonMessage', FB_API_URL)
    await axios.post(FB_API_URL, messageData)
    console.log(`The message with buttons sent ${recipientId}`)
  } catch (error) {
    console.error('Error sending message with buttons:', error.response ? error.response.data : error.message)
  }
}


exports.saveFileLocally = async (fileUrl, fileType) => {
  try {
    const ATTACHMENTS = process.env.ATTACHMENTS || 'ATTACHMENTS'
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
    const fileName = `${Date.now()}-${fileType}${path.extname(fileUrl)}`
    const filePath = path.join(__dirname, ATTACHMENTS, fileName)

    fs.mkdirSync(path.dirname(filePath), { recursive: true })

    fs.writeFileSync(filePath, response.data)
    console.log(`File saved locally: ${filePath}`)
  } catch (error) {
    console.error('Error saving file locally:', error.message)
  }
}

exports.getFileUrl = async (mediaId, accessToken) => {
  const url = `https://graph.facebook.com/${API_VERSION}/${mediaId}`
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response.data.url
}