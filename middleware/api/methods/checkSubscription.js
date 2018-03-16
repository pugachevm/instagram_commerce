let method = require('./method');

module.exports = function(models) {
    return method(models, checkSubscription)
};

function checkSubscription(instagramNickname) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    const FOLLOWER_FETCH_TIMEOUT_APPRX = 3600 * 24 * (1/12) * 1000;

    return new Promise((resolve, reject) => {

        InstagramFollowers
            .findOne({ instagramNickname }, function(err, instFollower) {
                if(!!err) { return reject(err) }

                if(!!instFollower == false) { return resolve(false) }

                let { instagramNickname, cursor, updatedAt } = instFollower;

                if(!cursor) { return resolve(true) }

                let _currentTimestamp = +(new Date()),
                    _updatedTimestamp = +(new Date(updatedAt));

                if(_currentTimestamp - _updatedTimestamp >= FOLLOWER_FETCH_TIMEOUT_APPRX) {
                    return resolve(false)
                }

                return resolve(true);

                /*fetchFollowers(false, cursor)
                    .then(followers => {
                        followers.forEach((node, i) => {
                            let follower = node.node;

                            if(instagramNickname == follower.username) {
                                return resolve(true)
                            }

                            if(i >= followers.length-1) {
                                return resolve(false)
                            }
                        })
                    })*/
            })

    })
}