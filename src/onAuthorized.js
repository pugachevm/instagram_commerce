var fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, data) {

    var $bot = this,
        accessToken = data.accessToken,
        profile = data.profile,
        userData = {
            instagramId: +profile.id,
            instagramNickname: profile.username
        },
        getChatId = $bot.getChatId;

    getChatId(userData)
        .then(function(chatId) {
            $api.updateUserData({ chatId: chatId }, userData)
                .then(function(user) {
                    console.log('$bot: %o', $bot);
                    $bot.emit('subscribe', accessToken)
                })
        });

};