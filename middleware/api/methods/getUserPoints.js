let method = require('./method');

module.exports = function(models) {
    return method(models, getUserPoints)
};

function getUserPoints(userData) {
    let models = this,
        Users = models.Users;

    return new Promise((resolve, reject) => {

        Users
            .findOne(userData)
            .populate({ path: 'scores', model: 'Scores' })
            .exec((err, user) => {
                if(!!err) { return reject(err) }

                if(!!user == false || !!user.scores == false) { return reject(null)}

                return resolve(user.scores)

            })

    })
}