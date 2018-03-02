var fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, chatId, context) {

    var $bot = this,
        userData = context.from,
        stateData = context.state.data,
        user = {
            telegramId: userData.id,
            telegramNickname: userData.username,
            firstName: userData.first_name,
            lastName: userData.last_name
        };

    $api.setChatId(user, chatId)
        .then(function(user) {

            if(stateData.args) {
                $bot.send(MESSAGES.startByInvitation.replace(/\$user/g, stateData.args))
            }

            $bot.send(MESSAGES.signIn, $bot.getKeyboard(BUTTONS.signIn))
        });

        $bot.action('/rules', function(cotext) {
            console.log('Rules')
            return context.reply('Rules requested')
        })

        $bot.hears(/.+/, function(context) {
            return context.reply('aaaaaa', $bot.getKeyboard(BUTTONS.menu, 'inline', { columns: 1 }))
        })

    return context.reply(MESSAGES.start, $bot.getKeyboard(BUTTONS.callMenu, 'static'))

};