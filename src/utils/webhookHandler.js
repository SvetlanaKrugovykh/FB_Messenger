const botService = require('../services/messageService')
const { sendTxtMsgToTelegram } = require('../services/re-send')

exports.processEvent = async (event) => {
  const senderId = event.sender.id
  const platform = 'facebook'

  try {
    if (event?.postback?.payload) {
      const userMessage = event?.postback?.title
      const text = `📌${event.postback.payload}`
      await botService.sendTextMessage(senderId, userMessage)
      await sendTxtMsgToTelegram(text, platform, senderId)
    }
  } catch (error) {
    console.error('Error processing event:', error)
  }
}

exports.handlePostback = async (event) => {
  await exports.processEvent(event)
}

