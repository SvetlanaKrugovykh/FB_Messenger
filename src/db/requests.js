const { execPgQuery } = require('../db/common')

module.exports.insertMessage = async function (data) {
  const query = `
    INSERT INTO messages (
      platform, sender_id, recipient_id, received_at, message_id, message_text, message_type, attachment_type, attachment_url, attachment_filename, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `
  const values = [
    data.platform,
    data.sender_id,
    data.recipient_id,
    data.received_at,
    data.message_id,
    data.message_text,
    data.message_type,
    data.attachment_type,
    data.attachment_url,
    data.attachment_filename,
    data.status
  ]
  return execPgQuery(query, values)
}