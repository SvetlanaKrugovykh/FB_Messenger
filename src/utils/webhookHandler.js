const botService = require('../services/botService')

exports.processEvent = async (event) => {
  const senderId = event.sender.id

  if (event.message && event.message.text) {
    const userMessage = event.message.text

    // Welcome message
    if (userMessage.toLowerCase().includes('hello')) {
      await botService.sendTextMessage(senderId, 'Вас приветствует наша компания! Как мы можем помочь?')
      await botService.sendButtonMessage(senderId, 'Выберите действие:', [
        {
          type: 'postback',
          title: 'Отправить запрос',
          payload: 'SEND_REQUEST'
        },
        {
          type: 'postback',
          title: 'Связаться с нами',
          payload: 'CONTACT_US'
        }
      ])
    }
  } else if (event.postback && event.postback.payload) {
    switch (event.postback.payload) {
      case 'SEND_REQUEST':
        await botService.sendTextMessage(senderId, 'Ваш запрос отправлен!')
        break
      case 'CONTACT_US':
        await botService.sendTextMessage(senderId, 'Наши контакты: +1234567890')
        break
      default:
        await botService.sendTextMessage(senderId, 'Извините, я не понимаю вашу команду.')
    }
  }
}
