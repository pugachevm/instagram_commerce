var method = require('./method');

module.exports = function(models) {
    return method(models, updateUserData)
};

function updateUserData(userSearch, userData) {

    var models = this,
        Users = models.Users;

    return new Promise(function(resolve, reject) {

        Users
            .findOneAndUpdate(userSearch, userData, { upsert: true }, function(err, user) {

                if(!!err) {
                    return reject(err)
                }

                user = !!user ? user : new Users(userData);

                user.save(function(err) {

                    if(!!err) {
                        return reject(err)
                    }

                    return resolve(user)

                })

            })

    })
}