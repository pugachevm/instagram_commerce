let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api) {
    let $bot = this,
        user = $bot.$user;
    
    $api.getUserData(user.telegramId)
        .then(user => {
            let { instagramNickname } = user;

            return $api.checkSubscription(instagramNickname)
        })
        .then(isSubscribed => {
            if(!isSubscribed) {
                return $bot.send(MESSAGES.subscribe, $bot.getKeyboard(BUTTONS.subscribe.map(button => {
                    let { label, value } = button;
            
                    value = value.replace(/\$domain/i, $bot.$middlewareUri);
            
                    return { label, value }
                })))
            }

            $bot.send(MESSAGES.subscribed);

            return $bot.emit('subscribed')
        })
        .catch(console.error);
};