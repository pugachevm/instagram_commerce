let sessionParser = require('express-session'),
    InstagramCommerce = require('./InstagramCommerce'),
    App = require('../middleware/app'),
    Api = require('../middleware/api');

// Telegram Bot methods requirements
let onStart = require('./onStart'),
    onMenuRequested = require('./onMenuRequested'),
    onRulesRequested = require('./onRulesRequested'),
    onPointsRequested = require('./onPointsRequested'),
    onTopRequested = require('./onTopRequested'),
    onRewardsRequested = require('./onRewardsRequested'),
    onFriendInviteRequested = require('./onFriendInviteRequested')
    onWhoAmI = require('./onWhoAmI')
    onAuthorized = require('./onAuthorized'),
    onSubscribe = require('./onSubscribe'),
    onSubscribed = require('./onSubscribed'),
    onGetChatId = require('./onGetChatId');

const PROTO = process.env.PROTO || 'http';
const DOMAIN = process.env.DOMAIN || 'pugachev-official.com';
const PORT = process.env.PORT || '80';
const TELEGRAM_BOT_TOKEN = '533313892:AAEy2L5RXz5fQFfoHmIRx7tpKwBOru7bOnA';

let $bot = new InstagramCommerce(TELEGRAM_BOT_TOKEN),
    middlewareUri = [ PROTO, '://', DOMAIN, ':', PORT ].join('');

module.exports = function() {
    console.log('Connected to mLab');

    var api = Api(this);

    // Run Telegram Bot
    $bot
        .on('/start', onStart)
        .hears(/меню/i, onMenuRequested)
        .action(':back', onMenuRequested)
        .action(':rules', onRulesRequested)
        .action(':points', onPointsRequested)
        .action(':top@20', onTopRequested)
        .action(':rewards', onRewardsRequested)
        .action(':invite@friend', onFriendInviteRequested)
        .action(':whoami', onWhoAmI)
        .on('authorized', onAuthorized)
        .on('subscribe', onSubscribe)
        .on('subscribed', onSubscribed)
        .on('getChatId', onGetChatId)
        .start(api.method, middlewareUri);

    // Run the Web-server
    App.call({
        sessionParser: sessionParser
    }, PROTO, DOMAIN, PORT,
        data => $bot.emit('authorized', data),
        () => $bot.emit('subscribed')
    );
};