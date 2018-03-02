let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {

    let $bot = this,
        userData = context.from;
    
    return context.editMessageText([
        MESSAGES.invitationLink,
        'tg://resolve?domain=pugachevs_bot&start=$user'.replace(/\$user/g, userData.username)
    ].join(''))//, $bot.getKeyboard(BUTTONS.menuBack))
};