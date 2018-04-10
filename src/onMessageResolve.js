let fs = require('fs');

const BUTTONS = JSON.parse(fs.readFileSync('./src/buttons.json', 'utf-8'));
const MESSAGES = JSON.parse(fs.readFileSync('./src/messages.json', 'utf-8'));
const ADMINS = JSON.parse(fs.readFileSync('./src/admins.json', 'utf-8'));
const STORAGE_MESSAGES = {};

module.exports = function($api, chatId, context) {
    let $bot = this,
        userData = context.from,
        stateData = context.state.data,
        user = {
            telegramId: userData.id,
            telegramNickname: userData.username,
            firstName: userData.first_name,
            lastName: userData.last_name
        },
        { param, args } = stateData,
        isAdmin = ADMINS.find(admin => admin == chatId),
        $message = [];

    if(!isAdmin) {
        return
    }

    dispatchAll = dispatchAll.bind({ $api, $bot });

    let _message = formatArgs(args);

    switch(param) {
        case 'new':
            messageResolver(_message.id, _message);
            $message.push([ _message.text, ' было *добавлено* в очередь' ].join(''));
            break;
        case 'delete':
            messageResolver(args);
            $message.push([ args, ' было *удалено* из очереди' ].join(''));
            break;
        case 'all':
            let messageIds = Object.keys(STORAGE_MESSAGES);

            if(!messageIds.length) {
                $message.push('_Сообщений нет_')
            }
            messageIds.forEach(id => {
                let _message = STORAGE_MESSAGES[id];
                $message.push([ '*'+ id +'*', _message.text ].join(': '))
            });
            break;
        case 'help':
            $message.push(['*/message@new* *ДД*.*ММ* *чч*.*мм* *\*Ваше сообшение\**', 'Команда добавляет новое сообщение в очередь на отправку в указанные день месяца и время дня'].join(' - '));
            $message.push(['*/message@delete* *Номер сообщения*', 'Удаляет сообщение из очереди'].join(' - '));
            $message.push(['*/message@all*', 'Выдает список всех сообщений в очереди, в формате: Номер сообщения: Текст сообщения'].join(' - '));
            break;
    }

    return $bot.reply(
        context,
        $message.join('\r\n')
    )
};

function messageResolver(id, message) {
    let _message = STORAGE_MESSAGES[id];

    _message && clearTimeout(_message.to);

    if(message) {console.log('%o: %oms', id, message.ms);
        message.to = setTimeout(() => { clearTimeout(message.to); dispatchAll(message) }, message.ms);
        return STORAGE_MESSAGES[id] = message;
    }

    return delete STORAGE_MESSAGES[id]
}

function formatArgs(args) {
    let [ date, time ] = args.split(' ');

    if(!date || !time) { return {} }

    let day = +date.substr(0,2),
        month = +date.substr(3,5),
        hours = +time.substr(0,2),
        minutes = +time.substr(3,5),
        timeNow = +(new Date()),
        timeEnd = +(new Date(2018, month-1, day, hours, minutes));
    
    return {
        ms: Math.max(0, timeEnd - timeNow),
        id: +[ day, month, hours, minutes ].join(''),
        text: args.substr(12) || ''
    }
}

function dispatchAll({ id, text }) {
    let { $api, $bot } = this;

    $api.getUsersByCriteria({ firstName: 'asc' })
        .then(users => {
            users.forEach(user => {
                $bot.dispatch(user.telegramId, text)
                    .catch(console.error)
            });
            messageResolver(id);
        })
        .catch(console.error);
}