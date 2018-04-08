let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api) {
    let $bot = this;
    
    $bot.send(
        MESSAGES.activated,
        $bot.getKeyboard(BUTTONS.subscribe)
    );

    $bot.send(MESSAGES.activationNotation, $bot.getKeyboard(BUTTONS.callAmSubscribed))
};