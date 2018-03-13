let method = require('./method');

module.exports = function(models) {
    return method(models, getUserData)
};

function getUserData(telegramId) {
    let models = this,
        Users = models.Users;

    return new Promise((resolve, reject) => {

        Users
            .findOne({ telegramId }, function(err, user) {
                if(!!err) { return reject(err) }

                if(!!user == false) { return reject(new Error('User not found')) }

                return resolve(user)

            })

    })
}