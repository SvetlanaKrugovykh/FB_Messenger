const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
  user: process.env.MSG_DB_USER,
  host: process.env.MSG_DB_HOST,
  database: process.env.MSG_DB_NAME,
  password: process.env.MSG_DB_PASSWORD,
  port: process.env.MSG_DB_PORT,
})

const tableNames = ['messages']

const tableQueries = {
  'messages': `
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(50) NOT NULL,
      sender_id VARCHAR(50) NOT NULL,
      recipient_id VARCHAR(50) NOT NULL,
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      message_id VARCHAR(100) NOT NULL,
      message_text TEXT,
      message_type VARCHAR(50),
      attachment_type VARCHAR(50),
      attachment_url TEXT,
      attachment_filename VARCHAR(255),
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
}

module.exports.updateTables = function () {
  checkAndCreateTable('messages')
    .then(() => {
      console.log('All tables created or already exist.')
    })
    .catch((err) => {
      console.error('Error in table creation sequence:', err)
    })
}


function checkAndCreateTable(tableName) {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = $1
      )`,
      [tableName],
      (err, res) => {
        if (err) {
          console.error(`Error checking if table ${tableName} exists:`, err)
          reject(err)
          return
        }
        const tableExists = res.rows[0].exists
        if (!tableExists) {
          createTable(tableName).then(resolve).catch(reject)
        } else {
          console.log(`Table ${tableName} already exists.`)
          resolve()
        }
      }
    )
  })
}



function createTable(tableName) {
  return new Promise((resolve, reject) => {
    const query = tableQueries[tableName]
    if (!query) {
      console.error(`No query found for table ${tableName}`)
      reject(new Error(`No query found for table ${tableName}`))
      return
    }

    pool.query(query, (err, res) => {
      if (err) {
        console.error(`Error creating table ${tableName}:`, err)
        reject(err)
      } else {
        console.log(`Table ${tableName} created successfully.`)
        resolve()
      }
    })
  })
}