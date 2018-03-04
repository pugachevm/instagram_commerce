let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {

    let $bot = this;
    
    return context.answerCbQuery()
        .then(() => $bot.editMessage(
            context,
            'Top20 requested',
            $bot.getKeyboard(BUTTONS.menuBack)
        ))
};