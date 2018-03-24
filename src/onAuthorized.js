let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, data) {
    let $bot = this,
        { accessToken, profile } = data,
        userData = {
            instagramId: +profile.id,
            instagramNickname: profile.username
        };

    $bot.getChatId(userData)
        .then(function(chatId) {
            $api.updateUserData({ chatId }, userData)
                .then(function(user) {
                    $bot.emit('subscribe', accessToken)
                })
        });

};