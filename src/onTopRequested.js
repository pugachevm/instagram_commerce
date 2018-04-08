let fs = require('fs'),
    declineOfNumber = require('../utils/declineOfNumber');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        $messages = [ MESSAGES.topUsers.title ],
        $units = MESSAGES.topUsers.units;

    $api.getUsersByCriteria({ preCountedPoints: -1})
        .then((users) => {
            users.forEach((user, i) => {
                let { firstName, preCountedPoints } = user;
                firstName = firstName || 'Аноним';

                $messages.push(`*${i+1}.*${firstName}: *${preCountedPoints}* ${declineOfNumber($units)(Math.floor(preCountedPoints))}\r\n`)
            });

            return context.answerCbQuery()
                .then(() => $bot.editMessage(
                    context,
                    $messages.join(''),
                    $bot.getKeyboard(BUTTONS.menuBack)
                ))
        })
        .catch(console.error);
};