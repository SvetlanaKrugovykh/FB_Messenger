const axios = require('axios')
require('dotenv').config()

exports.getWhatsAppMessages = async (body) => {
  console.log(`Received message: ${JSON.stringify(body)}`)
  try {
    for (let entry of body.entry) {
      for (let change of entry.changes) {
        const message = change.value.messages[0]
        const contact = change.value.contacts[0]
        const wa_id = contact.wa_id

        if (message.type === 'text') {
          console.log(`Message from: ${contact.profile.name}, text: ${message.text.body}`)
        } else if (message.type === 'image' || message.type === 'document' || message.type === 'audio' || message.type === 'video') {
          console.log(`Received a ${message.type} from: ${contact.profile.name}`)

          const mediaId = message[message.type].id
          const mimeType = message[message.type].mime_type
          const fileType = mimeType.split('/')[1] //file extension

          const fileUrl = await getFileUrl(mediaId, 'YOUR_ACCESS_TOKEN')
          await saveFileLocally(fileUrl, fileType)
          console.log(`${message.type} saved locally.`)
        } else if (message.type === 'location') {
          console.log(`Received location from ${contact.profile.name}: Latitude ${message.location.latitude}, Longitude ${message.location.longitude}`)
        } else {
          console.log(`Unsupported message type: ${message.type}`)
        }

        exports.sendWhatsAppMessage(wa_id, 'Thanks for the message!')
      }
    }
  } catch (error) {
    console.error('Error processing message:', error.message)
  }
}


exports.sendWhatsAppMessage = async (wa_id, message) => {
  try {
    const API_VERSION = process.env.API_VERSION
    const BUSINESS_PHONE_NUMBER_ID = process.env.BUSINESS_PHONE_NUMBER_ID
    const BUSINESS_PHONE_NUMBER_ACCESS_TOKEN = process.env.BUSINESS_PHONE_NUMBER_ACCESS_TOKEN
    const url = `https://graph.facebook.com/${API_VERSION}/${BUSINESS_PHONE_NUMBER_ID}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      to: wa_id,
      text: { body: message }
    }
    const Authorization = `Bearer ${BUSINESS_PHONE_NUMBER_ACCESS_TOKEN}`
    const response = await axios.post(url, payload, {
      headers: { Authorization: Authorization, 'Content-Type': 'application/json' }
    })
    console.log('Message sent:', response.data)
  } catch (error) {
    console.error('Error sending message:', error.message)
  }
}

