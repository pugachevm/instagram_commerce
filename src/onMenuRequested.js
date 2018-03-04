let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        type = context.updateType,
        $menu = $bot.getKeyboard(BUTTONS.menu);
    
    return type == 'callback_query'
        ? context.answerCbQuery(MESSAGES.loading).then(() => $bot.editMessage(context, MESSAGES.menuRequested, $menu))
        : context.reply(MESSAGES.menuRequested, $menu)
};