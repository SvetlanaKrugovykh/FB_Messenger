const axios = require('axios')
const { sendTxtMsgToTelegram } = require('../services/re-send')



exports.handleQuickReply = async (event) => {
  const senderId = event.sender.id
  const quickReply = event.message.quick_reply
  const payload = quickReply.payload
  const platform = 'facebook'
  const text = `📌${event.message.text}`

  console.log('Postback received:', payload)
  await sendTxtMsgToTelegram(text, platform, senderId)
}
