var Models = require('./models'),
    Methods = require('./methods');

module.exports = function(mongoose, PROTO, DOMAIN, PORT) {

    var models = Models(mongoose),
        methods = Methods(models);

    return {
        model: models,
        method: methods
    }

};