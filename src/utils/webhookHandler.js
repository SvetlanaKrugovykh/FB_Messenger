const botService = require('../services/messageService')

exports.processEvent = async (event) => {
  const senderId = event.sender.id

  if (event?.message?.text) {
    const userMessage = event.message.text

    if (userMessage.toLowerCase().includes('hello')) {
      await botService.sendTextMessage(senderId, 'Welcome to our bot!')
      await botService.sendButtonMessage(senderId, 'Choose the action:', [
        {
          type: 'postback',
          title: 'Send request',
          payload: 'SEND_REQUEST'
        },
        {
          type: 'postback',
          title: 'Contact us',
          payload: 'CONTACT_US'
        }
      ])
    }
  } else if (event.postback && event.postback.payload) {
    switch (event.postback.payload) {
      case 'SEND_REQUEST':
        await botService.sendTextMessage(senderId, 'You selected to send a request')
        break
      case 'CONTACT_US':
        await botService.sendTextMessage(senderId, 'The contact information is:')
        break
      default:
        await botService.sendTextMessage(senderId, 'Unknown postback payload!')
    }
  }
}

exports.handlePostback = async (event) => {
  await exports.processEvent(event)
}