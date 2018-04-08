let method = require('./method');

module.exports = function (models) {
    return method(models, getUsersByCriteria)
};

function getUsersByCriteria(sortRule) {
    let models = this,
        { Users } = models;

    return paginateUsers.call(models, sortRule)
}

function paginateUsers(sortRule, page = 1, limit = 20) {
    let { Users } = this,
        skip = (page - 1) * limit,
        allUsers = [];

    return new Promise((resolve, reject) => {
        Users
            .find()
            .sort(sortRule)
            .limit(limit)
            .skip(skip)
            .exec(execUsers)

        function execUsers(err, users) {
            if (!!err) { return reject(err) }
            if (!!users == false) { return reject(new Error('User not found by criteria')) }

            users.forEach(user => allUsers.push(user));

            if (users.length && users.length < limit) {
                return resolve(allUsers)
            }
            page++;
            skip = (page - 1) * limit;

            return Users
                .find()
                .sort(sortRule)
                .limit(limit)
                .skip(skip)
                .exec(execUsers)
        }
    })
}