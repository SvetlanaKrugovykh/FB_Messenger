const botService = require('../services/messageService')

exports.processEvent = async (event) => {
  const senderId = event.sender.id

  try {
    if (event?.postback?.payload) {
      const userMessage = event?.postback?.title
      await botService.sendTextMessage(senderId, userMessage)
    }
  } catch (error) {
    console.error('Error processing event:', error)
  }
}

exports.handlePostback = async (event) => {
  await exports.processEvent(event)
}