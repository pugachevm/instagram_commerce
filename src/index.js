var sessionParser = require('express-session'),
    InstagramCommerce = require('./InstagramCommerce'),
    App = require('../middleware/app'),
    Api = require('../middleware/api');

// Telegram Bot methods requirements
var onStart = require('./onStart'),
    onAuthorized = require('./onAuthorized'),
    onSubscribe = require('./onSubscribe'),
    onGetChatId = require('./onGetChatId');

const PROTO = process.env.PROTO || 'http';
const DOMAIN = process.env.DOMAIN || 'instagram-commerce.herokuapp.com';
const PORT = process.env.PORT || '3000';
const TELEGRAM_BOT_TOKEN = '533313892:AAEy2L5RXz5fQFfoHmIRx7tpKwBOru7bOnA';

var $bot = new InstagramCommerce(TELEGRAM_BOT_TOKEN);

module.exports = function() {
    console.log('Connected to mLab');

    var api = Api(this);

    // Run Telegram Bot
    $bot
        .on('start', onStart)
        .on('authorized', onAuthorized)
        .on('subscribe', onSubscribe)
        .on('getChatId', onGetChatId)
        .start(api.method);

    // Run the Web-server
    App.call({
        sessionParser: sessionParser
    }, PROTO, DOMAIN, PORT, function(data) {
        return $bot.emit('authorized', data)
    })
};