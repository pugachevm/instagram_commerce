let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api) {
    let $bot = this,
        userData = $bot.getUser();

    if(!!userData == false) {
        return
    }
    
    $api.setUserPoints(userData.telegramNickname, { instagram: 'pugachevmark' })
        .then((user) => {
            let { instagramId, instagramNickname } = user;

            return $api.updateFollower({ instagramId, instagramNickname })
        })
        .then(user => {
            console.log('Subscribed: %o', user);

            $bot.send(MESSAGES.subscribed);
        })
        .catch(console.error)
};