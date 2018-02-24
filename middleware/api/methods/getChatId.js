var method = require('./method');

module.exports = function(models) {
    return method(models, getChatId)
};

function getChatId(userData) {

    var models = this,
        Users = models.Users;

    return new Promise(function(resolve, reject) {

        Users
            .findOne(userData, function(err, user) {

                if(!!err) {
                    return reject(err)
                }

                return resolve(user.chatId)

            })

    })
}