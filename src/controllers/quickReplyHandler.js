const { sendTxtMsgToTelegram } = require('../services/re-send')


exports.handleQuickReply = async (event) => {
  const senderId = event.sender.id
  const quickReply = event.message.quick_reply
  const payload = quickReply.payload
  const platform = 'facebook'

  console.log('Postback received:', payload)
  await sendMessage(senderId, `✅ ${payload}`)
  await sendTxtMsgToTelegram(quickReply, platform, senderId)
}

async function sendMessage(recipientId, text) {
  const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/${process.env.API_VERSION}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: text,
    },
  };

  try {
    const response = await axios.post(url, messageData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}