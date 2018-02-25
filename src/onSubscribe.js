var fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, accessToken) {

    var $bot = this;

    console.log('AccessToken: %o', accessToken);
    $bot.send(MESSAGES.subscribe, $bot.getKeyboard(BUTTONS.subscribe))
};