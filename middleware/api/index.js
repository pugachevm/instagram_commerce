var Models = require('./models'),
    Methods = require('./methods');

module.exports = function(mongoose) {

    var models = Models(mongoose),
        methods = Methods(models);

    return {
        model: models,
        method: methods
    }

}