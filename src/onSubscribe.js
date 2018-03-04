let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, accessToken) {
    let $bot = this;
    
    $bot.send(MESSAGES.subscribe, $bot.getKeyboard(BUTTONS.subscribe))
};