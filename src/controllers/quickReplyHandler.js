const { sendTextMessage } = require('../services/messageService')

exports.handleQuickReply = async (event) => {
  const senderId = event.sender.id
  const quickReplies = event.message.quick_replies

  for (let quickReply of quickReplies) {
    await exports.handleQuickReplyPayload(senderId, quickReply.payload)
    console.log(`Quick reply received from ${senderId}: ${quickReply.payload}`)

    switch (quickReply) {
      case 'PAYLOAD_OPTION_1':
        await sendTextMessage(senderId, 'You selected option 1')
        break
      case 'PAYLOAD_OPTION_2':
        await sendTextMessage(senderId, 'You selected option 2')
        break
      default:
        await sendTextMessage(senderId, `Unknown quick reply payload: ${quickReply.payload}`)
        break
    }
  }
}

exports.handleQuickReplyPayload = async (senderId, payload) => {
  console.log(`Handling quick reply payload: ${payload}`)
}