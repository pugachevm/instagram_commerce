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
            let friend = stateData.args,
                { telegramNickname } = user;

                console.log('Started USER: %o', user);

            if(!!friend && !!telegramNickname){//} && !!telegramNickname.match(new RegExp(`^${friend}$`)) == false) {
                console.log('INVITED BY: %o', friend);
                $api.getUserData(user.telegramId)
                    .then(user => {
                        let { invitedBy } = user;

                        if(!!invitedBy == false) {
                            return $api.setUserPoints(telegramNickname, { friend })
                                .then(user => {
                                    $bot.send(MESSAGES.startByInvitation.replace(/\$user/g, friend))
                                })
                        }

                        return $bot.send(MESSAGES.alreadyInvited)
                    })
                    .catch(console.error)
            }

            $bot.send(MESSAGES.signIn, $bot.getKeyboard(BUTTONS.signIn.map(button => {
                let { label, value } = button;

                value = value.replace(/\$domain/i, $bot.$middlewareUri);

                return { label, value }
            })))
        });

    return $bot.reply(
        context,
        MESSAGES.start,
        $bot.getKeyboard(BUTTONS.callAmSubscribed, 'static')
    )
};