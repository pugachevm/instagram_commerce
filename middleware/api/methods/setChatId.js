var method = require('./method');

module.exports = function(models) {
    return method(models, setChatId)
}

function setChatId(userData, chatId) {

    var models = this,
        Users = models.Users;

    return new Promise(function(resolve, reject) {

        var query = { chatId: chatId };

        Users
            .findOneAndUpdate(userData, query, { upsert: true }, function(err, user) {

                if(!!err) {
                    return reject(err)
                }

                if(!!user == false) {
                    userData = Object.assign(userData, query);
                    user = new Users(userData);
                }

                user.save(function(err) {

                    if(!!err) {
                        return reject(err)
                    }

                    return resolve(user)

                })

            })

    })
}