let method = require('./method');

module.exports = function(models) {
    return method(models, checkSubscription)
};

function checkSubscription(instagramNickname) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    return new Promise((resolve, reject) => {

        InstagramFollowers
            .findOne({ instagramNickname }, function(err, user) {
                if(!!err) { return reject(err) }

                if(!!user) { resolve(true) }

                return resolve(false)
            })

    })
}