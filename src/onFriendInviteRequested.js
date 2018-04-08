let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        userData = context.from,
        { username } = userData,
        $messages = [ MESSAGES.invitationFix ],
        $buttons = {},
        _invitationLink = 'https://telegram.me/pugachevs_bot?start=$user'.replace(/\$user/g, username);
        //'tg://resolve?domain=pugachevs_bot&start=$user'.replace(/\$user/g, userData.username);

    if(!!username) {
        $messages = [
            MESSAGES.invitationLink,
            `[${MESSAGES.contestName}](${_invitationLink})`
        ]
    }
    
    return context.answerCbQuery(MESSAGES.loading)
        .then(() => $bot.editMessage(
            context,
            $messages.join(''),
            $buttons
        ))
        .catch(console.error)
};