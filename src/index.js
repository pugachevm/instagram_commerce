let sessionParser = require('express-session'),
    InstagramCommerce = require('./InstagramCommerce'),
    App = require('../middleware/app'),
    Api = require('../middleware/api');

// Telegram Bot methods requirements
let _onMenuRequested = require('./onMenuRequested');

const PROTO = process.env.PROTO || 'http';
const DOMAIN = process.env.DOMAIN || 'pugachev-official.com';
const PORT = process.env.PORT || '80';
const TELEGRAM_BOT_TOKEN = Buffer.from('NTMzMzEzODkyOkFBRXkyTDVSWHo1ZlFGZm9IbUlSeDd0cEt3Qk9ydTdiT25B', 'base64');

let $bot = new InstagramCommerce(TELEGRAM_BOT_TOKEN),
    middlewareUri = [ PROTO, '://', DOMAIN, ':', PORT ].join('');

module.exports = function() {
    console.info('\x1b[33m%s\x1b[0m', 'Connected to mLab');

    let api = Api(this);

    // Run Telegram Bot
    $bot
        .on('/start', require('./onStart'))
        .on('/message', require('./onMessageResolve'))//god-mode
        .hears(/я\sподписался|меню/ig, _onMenuRequested)
        .action(':back', _onMenuRequested)
        .action(':rules', require('./onRulesRequested'))
        .action(':points', require('./onPointsRequested'))
        .action(':top@20', require('./onTopRequested'))
        .action(':rewards', require('./onRewardsRequested'))
        .action(':invite@friend', require('./onFriendInviteRequested'))
        .action(':whoami', require('./onWhoAmI'))
        .on('authorized', require('./onAuthorized'))
        .on('subscribe', require('./onSubscribe'))
        .on('getChatId', require('./onGetChatId'))
        .on('subscribeMiddleware', require('./subscribeMiddleware'))
        .start(api.method, middlewareUri);

    // Run the Web-server
    App.call({
        sessionParser: sessionParser
    }, PROTO, DOMAIN, PORT, {
        signIn: data => $bot.emit('authorized', data),
        subscribeMiddleware: () => $bot.emit('subscribeMiddleware')
    });
};