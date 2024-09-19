const axios = require('axios')

exports.getInstagramMessages = async (body) => {
  console.log(`Received Instagram message: ${JSON.stringify(body)}`)

  try {
    for (let entry of body.entry) {
      for (let change of entry.changes) {
        const message = change.value.messages[0]
        const contact = change.value.from
        const ig_id = contact.id

        if (message.type === 'text') {
          console.log(`Message from: ${contact.username}, text: ${message.text.body}`)
        } else if (message.type === 'image' || message.type === 'video') {
          console.log(`Received a ${message.type} from: ${contact.username}`)

          const mediaId = message[message.type].id
          const mimeType = message[message.type].mime_type
          const fileType = mimeType.split('/')[1] // file extension

          const fileUrl = await getFileUrl(mediaId, 'YOUR_ACCESS_TOKEN')
          await saveFileLocally(fileUrl, fileType)
          console.log(`${message.type} saved locally.`)
        } else {
          console.log(`Unsupported message type: ${message.type}`)
        }

        exports.sendInstagramMessage(ig_id, 'Thanks for the message!')
      }
    }
  } catch (error) {
    console.error('Error processing Instagram message:', error.message)
  }
}


exports.sendInstagramMessage = async (ig_id, message) => {
  try {
    const url = `https://graph.facebook.com/v13.0/YOUR_INSTAGRAM_ACCOUNT_ID/messages`
    const payload = {
      messaging_product: 'instagram',
      recipient: { id: ig_id },
      message: { text: message }
    }
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer YOUR_ACCESS_TOKEN`, 'Content-Type': 'application/json' }
    })
    console.log('Instagram message sent:', response.data)
  } catch (error) {
    console.error('Error sending Instagram message:', error.message)
  }
}
