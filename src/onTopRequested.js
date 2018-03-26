let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        $messages = [ MESSAGES.topUsers.title ],
        $unit = MESSAGES.topUsers.point;

    $api.getUsersByCriteria({ preCountedPoints: -1})
        .then((users) => {
            users.forEach((user, i) => {
                let { firstName, preCountedPoints } = user;
                firstName = firstName || 'Аноним';

                $messages.push(`*${i+1}.*${firstName}: *${preCountedPoints}* ${$unit}`)
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