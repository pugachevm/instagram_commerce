let method = require('./method');

module.exports = (models) => {
    return method(models, setChatId)
};

function setChatId(userData, chatId) {
    let models = this,
        Users = models.Users;

    return new Promise(function (resolve, reject) {

        let query = { chatId };

        Users.findOneAndUpdate(query, userData, { upsert: true }, (err, user) => {
            if (!!err) { return reject(err) }

            if (!!user == false) {
                user = new Users(Object.assign(userData, query));
            }

            user.save(function (err) {
                if (!!err) { return reject(err) }

                return resolve(user)

            })

        })

    })
}