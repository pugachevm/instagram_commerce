let method = require('./method');

module.exports = function(models) {
    return method(models, getUsersByCriteria)
};

function getUsersByCriteria(sortRule, limit=20) {
    let models = this,
        { Users } = models;

    return new Promise((resolve, reject) => {
        Users
            .find()
            .sort(sortRule)
            .limit(limit)
            .exec((err, users) => {
                if(!!err) { return reject(err) }
                if(!!users == false) { return reject(new Error('User not found by criteria')) }

                return resolve(users)
            })

    })
}