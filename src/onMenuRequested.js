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
        $menu = null,
        $menuMessage = MESSAGES.wrongSubscription;

    switch (match.lastIndex) {
        case menuModifiers.subscribed.length:

            context.answerCbQuery(MESSAGES.loading).then(() => {
                return $api.getUserData(context.from.id)
                    .then(user => {
                        let { instagramNickname } = user;

                        return $api.checkSubscription(instagramNickname, true)
                    })
                    .then(isSubscribed => {
                        if(isSubscribed) {
                            $menu = $bot.getKeyboard(BUTTONS.menu);
                            $menuMessage = MESSAGES.menuRequested;
                        }

                        return $bot.reply(
                            context,
                            MESSAGES.subscribed,
                            $bot.getKeyboard(BUTTONS.callMenu, 'static')
                        )
                    })
                    .catch(console.error);
            });
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