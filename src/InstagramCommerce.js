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

    this.on = function(event, action) {

        if(!!event.match(/^\:/)) {
            bot.command(event.slice(1), action);

            return this
        }

        addEvent.call(registeredEvents, event, action);

        return this
    };

    this.emit = function(event) {
        var actions = registeredEvents[event],
            _arguments = Array.prototype.splice.call(arguments, 1);
        
        _arguments.unshift($api);

        if(!!actions == false) {
            return
        }

        if(actions.length) {
            return actions.forEach(function(action, i) {
                action.apply(_this, _arguments);
            })
        }

        return actions.apply(_this, _arguments)
    };

    this.send = function(message, extra) {
        return _this.getChatId()
            .then(function(chatId) {
                return bot.telegram.sendMessage(chatId, message, extra);
            })
    };

    this.setChatId = function(_chatId) {
        chatId = _chatId;
    };

    this.getChatId = function(userData) {

        return new Promise(function(resolve, reject) {
            if(!!chatId) {
                return resolve(chatId)
            }

            var getChatId = _this.emit('getChatId', userData);

            if(isPromise(getChatId)) {
                return getChatId
                    .then(resolve)
                    .catch(reject)
            }

            if(!getChatId) {
                return reject(new Error('Wrong chat id'))
            }

            return resolve(getChatId)
        })
    };

    this.getKeyboard = function(buttons, type) {
        return buildKeyboard.call(Markup, buttons, type)
    };

    this.start = function(api) {

        $api = api;

        var setChatId = this.setChatId;

        return bot
            .start(function(context) {

                setChatId(context.chat.id);

                return _this.emit('start', chatId, context)
            })
            .hears(/(.*)/ig, function(context) {
                setChatId(context.chat.id);
            })
            .startPolling();
    }

}

function addEvent(event, action) {
    var events = this[event] || [];

    if(!isFunction(action)) {
        return
    }

    events.push(action);

    return this[event] = events
}

function buildKeyboard(buttons, type) {
    type = !!type ? type : 'inline';

    var markup = this,
        result = null;

    var keyboard = buttons.map(function(button) {
        var label = button.label,
            value = button.value;
        
        if(!!value.match(/\/\//i)) {
            return markup.urlButton(label, value)
        }

        return markup.callbackButton(label, value)
    });

    switch(type) {
        case 'inline':
            result = this.inlineKeyboard(keyboard).extra();
            break;
        default:
            result = this.resize().keyboard(keyboard).extra();
            break;
    }

    return result

}