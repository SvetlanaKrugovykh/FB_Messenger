const { saveMessage, handleAttachment } = require('../services/msg-save')

exports.getInstagramMessages = async function (body, who) {
  console.log(`Received Instagram message: ${JSON.stringify(body)}`)

  try {
    for (let entry of body.entry) {
      for (let _msg_ of entry.messaging) {
        const message = _msg_.message

        if (message?.text && message.text.toString().length > 0) {
          await saveMessage('Instagram', who, message, 'text')
        }
      }
    }
  } catch (error) {
    console.error('Error processing Instagram message:', error.message)
  }
}


