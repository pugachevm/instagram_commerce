let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api) {
    let $bot = this,
        userData = $bot.getUser();console.log('$userData: %o', userData);
    
    $api.setUserPoints(userData.telegramNickname, { instagram: 'pugachevmark' })
        .then((result) => {
            console.log('Success!!!!!')
        })
        .catch(console.error)
};