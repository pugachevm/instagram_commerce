let fs = require('fs'),
    constants = require('../middleware/api/constants');

const { MAIN_INSTAGRAM_REWARD } = constants;

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context, match={}) {
    let $bot = this,
        type = context.updateType,
        menuModifiers = {
            subscribed: 'я подписался',
            requested: 'меню'
        },
        $menu = {},
        $menuMessage = MESSAGES.wrongSubscription;

    switch (match.lastIndex) {
        case menuModifiers.subscribed.length:

            $bot.send(MESSAGES.checkingSubscription);

            return $api.getUserData(context.from.id)
                .then(user => {
                    let { instagramNickname } = user;console.log('Requested by: %o', instagramNickname);

                    return $api.checkSubscription(instagramNickname)
                })
                .then(isSubscribed => {
                    if(isSubscribed) {
                        $menuMessage = MESSAGES.subscribed;
                        $menu = $bot.getKeyboard(BUTTONS.callMenu, 'static');
                    }

                    return $bot.reply(
                        context,
                        $menuMessage,
                        $menu
                    )
                })
                .catch(console.error);
            break;

        default:

            $menu = $bot.getKeyboard(BUTTONS.menu);
            $menuMessage = MESSAGES.menuRequested;

            return type == 'callback_query'
                ? context.answerCbQuery(MESSAGES.loading).then(() => $bot.editMessage(context, $menuMessage, $menu))
                : $bot.reply(context, $menuMessage, $menu);
            break;
    }
};