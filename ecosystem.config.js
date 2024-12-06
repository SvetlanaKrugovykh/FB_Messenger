module.exports = {
  apps: [
    {
      name: 'facebook-bot-app',
      script: './src/server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      },
      env_production: {
        NODE_ENV: 'production',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      },
    },
  ],
}