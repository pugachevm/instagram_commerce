let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, chatId, context) {
    let $bot = this,
        userData = context.from,
        stateData = context.state.data,
        user = {
            telegramId: userData.id,
            telegramNickname: userData.username,
            firstName: userData.first_name,
            lastName: userData.last_name
        };

    $api.setChatId(user, chatId)
        .then((user) => {
            let friend = stateData.args;

            if(!!friend) {// && !!~stateData.args.indexOf(userData.username) == false) {
                $api.setUserPoints(user.telegramNickname, { friend })
                .then(user => {
                    $bot.send(MESSAGES.startByInvitation.replace(/\$user/g, friend))
                })
                .catch(err => console.error)
            }

            $bot.send(MESSAGES.signIn, $bot.getKeyboard(BUTTONS.signIn))
        });

    return $bot.reply(
        context,
        MESSAGES.start,
        $bot.getKeyboard(BUTTONS.callMenu, 'static')
    )

};