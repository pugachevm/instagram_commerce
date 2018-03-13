let sessionParser = require('express-session'),
    InstagramCommerce = require('./InstagramCommerce'),
    App = require('../middleware/app'),
    Api = require('../middleware/api');

// Telegram Bot methods requirements
let _onMenuRequested = require('./onMenuRequested');

const PROTO = process.env.PROTO || 'http';
const DOMAIN = process.env.DOMAIN || 'pugachev-official.com';
const PORT = process.env.PORT || '80';
const TELEGRAM_BOT_TOKEN = '533313892:AAEy2L5RXz5fQFfoHmIRx7tpKwBOru7bOnA';

let $bot = new InstagramCommerce(TELEGRAM_BOT_TOKEN),
    middlewareUri = [ PROTO, '://', DOMAIN, ':', PORT ].join('');

module.exports = function() {
    console.info('Connected to mLab');

    let api = Api(this);

    fetchLoop(api.method);// automatically fetches the followers till the end :)

    // Run Telegram Bot
    $bot
        .on('/start', require('./onStart'))
        .hears(/меню/i, _onMenuRequested)
        .action(':back', _onMenuRequested)
        .action(':rules', require('./onRulesRequested'))
        .action(':points', require('./onPointsRequested'))
        .action(':top@20', require('./onTopRequested'))
        .action(':rewards', require('./onRewardsRequested'))
        .action(':invite@friend', require('./onFriendInviteRequested'))
        .action(':whoami', require('./onWhoAmI'))
        .on('authorized', require('./onAuthorized'))
        .on('subscribe', require('./onSubscribe'))
        .on('subscribed', require('./onSubscribed'))
        .on('getChatId', require('./onGetChatId'))
        .start(api.method, middlewareUri);

    // Run the Web-server
    App.call({
        sessionParser: sessionParser
    }, PROTO, DOMAIN, PORT, {
        signIn: data => $bot.emit('authorized', data),
        subscribe: () => $bot.emit('subscribed')
    });
};

function fetchLoop($api)
{
    const LOOP_TIMEOUT = 3600 * 24 * (1/48);

    let _to = setTimeout(function() {
        clearTimeout(_to);

        $api.fetchFollowers();

        fetchLoop($api);
    }, LOOP_TIMEOUT);
}