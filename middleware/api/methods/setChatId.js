let method = require('./method');

module.exports = (models) => {
    return method(models, setChatId)
}

function setChatId(userData, chatId) {
    let models = this,
        Users = models.Users;

    return new Promise(function (resolve, reject) {

        let query = { chatId: chatId };

        Users.findOneAndUpdate(userData, query, { upsert: true }, (err, user) => {
            if (!!err) { return reject(err) }

            if (!!user == false) {
                userData = Object.assign(userData, query);
                user = new Users(userData);
            }

            user.save(function (err) {
                if (!!err) { return reject(err) }

                return resolve(user)

            })

        })

    })
}