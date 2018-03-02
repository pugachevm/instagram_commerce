var Telegraf = require('telegraf'),
    telegrafExtra = require('telegraf/extra'),
    telegrafSession = require('telegraf/session'),
    Markup = require('telegraf/markup'),
    isFunction = require('../utils/isFunction'),
    isPromise = require('../utils/isPromise');

module.exports = InstagramCommerce;

function InstagramCommerce(token) {

    var _this = this,
        bot = new Telegraf(token);

    var registeredEvents = {},
        $api = null,
        chatId = null;

    this.on = function (event, action) {
        addEvent.call(registeredEvents, event, action);

        return this
    };

    this.emit = function (event) {
        var actions = registeredEvents[event],
            _arguments = Array.prototype.splice.call(arguments, 1);

        _arguments.unshift($api);

        if (!!actions == false) {
            return
        }

        if (actions.length) {
            return actions.forEach(function (action, i) {
                action.apply(_this, _arguments);
            })
        }

        return actions.apply(_this, _arguments)
    };

    this.send = function (message, extra) {
        return _this.getChatId()
            .then(function (chatId) {
                return bot.telegram.sendMessage(chatId, message, extra);
            })
    };

    this.setChatId = function (_chatId) {
        chatId = _chatId;
    };

    this.getChatId = function (userData) {

        return new Promise(function (resolve, reject) {
            if (!!chatId) {
                return resolve(chatId)
            }

            var getChatId = _this.emit('getChatId', userData);

            if (isPromise(getChatId)) {
                return getChatId
                    .then(resolve)
                    .catch(reject)
            }

            if (!getChatId) {
                return reject(new Error('Wrong chat id'))
            }

            return resolve(getChatId)
        })
    };

    this.getKeyboard = function (buttons, type) {
        return buildKeyboard.call(Markup, buttons, type)
    };

    this.action = function (match, middleware) {
        var setChatId = _this.setChatId;

        bot.action.call(bot, match, function(context) {
            var chatId = context.chat.id;
            setChatId(chatId);

            return middleware.call(_this, $api, context)
        });

        return this
    }

    this.hears = function (match, middleware) {
        var setChatId = _this.setChatId;

        bot.hears.call(bot, match, function(context) {
            var chatId = context.chat.id;
            setChatId(chatId);

            return middleware.call(_this, $api, context)
        });

        return this
    }

    this.start = function (api) {

        $api = api;

        var setChatId = _this.setChatId,
            rule = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]*)$/i;

        return bot
            .command(_commandMiddleware)
            .startPolling();

        function _commandMiddleware(context, next) {
            var chatId = context.chat.id;
            setChatId(chatId);

            var opts = rule.exec(context.message.text);

            if (!opts) { return next() }

            var command = opts[1],
                data = {
                    text: context.message.text,
                    command: command,
                    param: opts[2],
                    args: opts[3]
                }; console.log('data: %o', data);

            context.state.data = data;

            _this.emit(['/', command].join(''), chatId, context)

            return next()
        }
    }

}

function addEvent(event, action) {
    var events = this[event] || [];

    if (!isFunction(action)) {
        return
    }

    events.push(action);

    return this[event] = events
}

function buildKeyboard(buttons, type, options) {
    type = !!type ? type : 'inline';

    var markup = this,
        result = null;

    var keyboard = buttons.map(function (button, i) {
        var label = button.label,
            value = button.value;

        if (!!value && !!value.match(/\:\/\//i)) {
            return [ markup.urlButton(label, value) ]
        }

        return [ markup.callbackButton(label, value) ]
    });

    switch (type) {
        case 'inline':
            result = this.inlineKeyboard(keyboard, options).extra();
            break;
        default:
            result = this.resize().keyboard(keyboard, options).extra();
            break;
    }

    return result

}