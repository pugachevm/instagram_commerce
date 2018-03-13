let fs = require('fs'),
    Extra = require('telegraf/extra');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        markup = Extra.markdown(),
        userData = context.from,
        _invitationLink = 'https://telegram.me/pugachevs_bot?start=$user'.replace(/\$user/g, userData.username);
        //'tg://resolve?domain=pugachevs_bot&start=$user'.replace(/\$user/g, userData.username);
        console.log(_invitationLink)
    
    return context.answerCbQuery(MESSAGES.loading)
        .then(() => $bot.editMessage(
            context, [ MESSAGES.invitationLink, `[${MESSAGES.contestName}](${_invitationLink})` ].join(''),
            markup
        ))
};