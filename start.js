module.exports = {
    apps: [
        {
          name: "pugachev-bot",
          script: "./index.js",
          watch: true,
          env: {
            "DOMAIN": "pugachev-official.com",
            "PORT": 80
          }
        }
    ]
  }