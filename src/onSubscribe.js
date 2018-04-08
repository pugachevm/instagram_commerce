let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));

module.exports = function($api) {
    let $bot = this;
    
    return $bot.send(
        MESSAGES.activated,
        $bot.getKeyboard(BUTTONS.subscribe.map(button => {
            let { label, value } = button;

            value = value.replace(/\$domain/i, $bot.$middlewareUri);

            return { label, value }
        }))
    );
};