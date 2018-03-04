let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {

    let $bot = this;
    
    return context.answerCbQuery(MESSAGES.loading)
        .then(() => $bot.editMessage(
            context,
            'Points requested',
            $bot.getKeyboard(BUTTONS.menuBack)
        ))
};