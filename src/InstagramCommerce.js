var Telegraf = require('telegraf'),
    Extra = require('telegraf/extra'),
    telegrafSession = require('telegraf/session'),
    Markup = require('telegraf/markup'),
    isFunction = require('../utils/isFunction'),
    isPromise = require('../utils/isPromise');

module.exports = InstagramCommerce;

function InstagramCommerce(token) {

    var _this = this,
        bot = new Telegraf(token),
        registeredEvents = {},
        $api = null;
    
    this.$chatId = null;
    this.$user = null;

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

    this.reply = function(ctx, message, extra={}) {
        return ctx.reply(message, Object.assign(extra, Extra.markdown()))
    };

    this.send = function (message, extra={}) {
        return _this.getChatId()
            .then(function (chatId) {
                return bot.telegram.sendMessage(chatId, message, Object.assign(extra, Extra.markdown()))
            })
    };

    this.editMessage = function(ctx, message, extra={}) {
        return ctx.editMessageText(message, Object.assign(extra, Extra.markdown()))
    }

    this.setChatId = setChatId;

    this.getChatId = function (userData) {

        return new Promise(function (resolve, reject) {
            if (!!_this.$chatId) {
                return resolve(_this.$chatId)
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

    this.setUser = setUser;

    this.getUser = function() {
        return _this.$user
    };

    this.getKeyboard = function (buttons, type) {
        return buildKeyboard.call(Markup, buttons, type)
    };

    this.action = function (match, middleware) {
        bot.action.call(bot, match, function(context) {
            var chatId = context.chat.id;
            setChatId.call(_this, chatId);
            setUser.call(_this, context.from);

            return middleware.call(_this, $api, context)
        });

        return this
    }

    this.hears = function (match, middleware) {
        bot.hears.call(bot, match, function(context) {
            var _chatId = context.chat.id;
            setChatId.call(_this, _chatId);
            setUser.call(_this, context.from);

            return middleware.call(_this, $api, context)
        });

        return this
    }

    this.start = function (api) {

        $api = api;

        var rule = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]*)$/i;

        return bot
            .command(_commandMiddleware)
            .startPolling();

        function _commandMiddleware(context, next) {
            var _chatId = context.chat.id;
            setChatId.call(_this, _chatId);
            setUser.call(_this, context.from);console.log('user: %o', _this.$user);

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

            _this.emit(['/', command].join(''), _chatId, context)

            return next()
        }
    }

}

function setChatId(_chatId) {
    this.$chatId = _chatId;
}

function setUser(_userData) {
    this.$user = {
        telegramId: _userData.id,
        telegramNickname: _userData.username,
        firstName: _userData.first_name,
        lastName: _userData.last_name
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