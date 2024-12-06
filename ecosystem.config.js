const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  apps: [
    {
      name: 'FB-messenger',
      script: './src/server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        HOST: process.env.HOST,
        DOWNLOAD_APP_PATH: process.env.DOWNLOAD_APP_PATH,
        PORT: process.env.PORT,
        DEBUG_LEVEL: process.env.DEBUG_LEVEL,
        MSG_DB_HOST: process.env.MSG_DB_HOST,
        MSG_DB_PORT: process.env.MSG_DB_PORT,
        MSG_DB_NAME: process.env.MSG_DB_NAME,
        MSG_DB_USER: process.env.MSG_DB_USER,
        MSG_DB_PASSWORD: process.env.MSG_DB_PASSWORD,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        GROUP_ID: process.env.GROUP_ID,
        FB_API_URL: process.env.FB_API_URL,
        FB_GraphQL_Explorer: process.env.FB_GraphQL_Explorer,
        VERIFY_TOKEN: process.env.VERIFY_TOKEN,
        API_VERSION: process.env.API_VERSION,
        APP_ID: process.env.APP_ID,
        APP_SECRET: process.env.APP_SECRET,
        APP_NAME: process.env.APP_NAME,
        APP_ACCESS_TOKEN: process.env.APP_ACCESS_TOKEN,
        FB_PAGE_ACCESS_TOKEN: process.env.FB_PAGE_ACCESS_TOKEN,
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: process.env.HOST,
        DOWNLOAD_APP_PATH: process.env.DOWNLOAD_APP_PATH,
        PORT: process.env.PORT,
        DEBUG_LEVEL: process.env.DEBUG_LEVEL,
        MSG_DB_HOST: process.env.MSG_DB_HOST,
        MSG_DB_PORT: process.env.MSG_DB_PORT,
        MSG_DB_NAME: process.env.MSG_DB_NAME,
        MSG_DB_USER: process.env.MSG_DB_USER,
        MSG_DB_PASSWORD: process.env.MSG_DB_PASSWORD,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        GROUP_ID: process.env.GROUP_ID,
        FB_API_URL: process.env.FB_API_URL,
        FB_GraphQL_Explorer: process.env.FB_GraphQL_Explorer,
        VERIFY_TOKEN: process.env.VERIFY_TOKEN,
        API_VERSION: process.env.API_VERSION,
        APP_ID: process.env.APP_ID,
        APP_SECRET: process.env.APP_SECRET,
        APP_NAME: process.env.APP_NAME,
        APP_ACCESS_TOKEN: process.env.APP_ACCESS_TOKEN,
        FB_PAGE_ACCESS_TOKEN: process.env.FB_PAGE_ACCESS_TOKEN,
      },
    },
  ],
}