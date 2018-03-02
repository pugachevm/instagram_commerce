var fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {

    var $bot = this;

    console.log('$bot from action: %o', $bot.action);
    
    return context.reply('Rules requested')
};