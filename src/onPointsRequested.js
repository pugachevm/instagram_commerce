let fs = require('fs'),
    constants = require('../middleware/api/constants');

/*const {
    REWARD_FOR_INIT,
    REWARD_FOR_INSTAGRAM,
    REWARD_FOR_INVITATION_INIT,
    REWARD_FOR_INIVITATION_INSTAGRAM,
    REWARD_FOR_INVITATION_AMOUNT
} = constants;*/

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api, context) {
    let $bot = this,
        userData = context.from,
        { username } = userData;
    
    return context.answerCbQuery(MESSAGES.loading)
        .then(() => {
            $api.getUserPoints({ telegramNickname: username })
                .then((points) => {
                    let $message = MESSAGES.points.rows,
                        $done = MESSAGES.points.done,
                        $pending = MESSAGES.points.pending,
                        _preCountedPoints = 0,
                        replacements = {
                            $signup: points.initAction,
                            $instagramSubscriptions: points.instagramSubscriptions,
                            $friendsInvitations: points.friendsInvitations,
                            $bonus: points.returnable,
                            $preCountedPoints: _preCountedPoints
                        };

                    console.log(points);

                    Object.keys(points).forEach(key => replacements.$preCountedPoints += points[key]);
                    
                    $message = $message.map(item => {
                        return item.replace(new RegExp(Object.keys(replacements).map(key => key.replace(/\$/i, '\\$')).join('|'), 'ig'), key => '+' + replacements[key])
                    });

                    $bot.editMessage(
                        context,
                        $message.join(''),
                        $bot.getKeyboard(BUTTONS.menuBack)
                    )
                })
                .catch(console.error)
        })
};