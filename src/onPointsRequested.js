let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

const POINT_INIT_ACTION = 1;
const POINT_INSTAGRAM_SUBSCRIPTION = 3;
const POINT_FRIEND_SUBSCRIPTION = 2;

module.exports = function($api, context) {
    let $bot = this,
        userData = context.from,
        { username } = userData;
    
    return context.answerCbQuery(MESSAGES.loading)
        .then(() => {
            $api.getUserPoints({ telegramNickname: username })
                .then((scores) => {
                    let $message = [ MESSAGES.points.title ],
                        $done = MESSAGES.points.done,
                        $pending = MESSAGES.points.pending,
                        { instagramSubscriptions, friendsInvitations, initAction } = scores,
                        summary = 0;
                    
                    if(initAction) {
                        summary += POINT_INIT_ACTION;
                    }

                    let instagramPoints = instagramSubscriptions.length * POINT_INSTAGRAM_SUBSCRIPTION,
                        friendsPoints = friendsInvitations.length * POINT_FRIEND_SUBSCRIPTION;

                    summary += instagramPoints > 0 ? instagramPoints : 0;
                    summary += friendsPoints > 0 ? friendsPoints : 0;

                    $message.push(MESSAGES.points.initAction.replace(/\$state/i, (initAction ? $done : $pending)));
                    $message.push(MESSAGES.points.instagram[0].replace(/\$state/i, (instagramSubscriptions.length ? $done : $pending)));
                    $message.push(MESSAGES.points.friends.replace(/\$friendsPoints/i, friendsPoints));
                    $message.push(MESSAGES.points.total.replace(/\$points/i, summary));

                    $bot.editMessage(
                        context,
                        $message.join(''),
                        $bot.getKeyboard(BUTTONS.menuBack)
                    )
                })
        })
};