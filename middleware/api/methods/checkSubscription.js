let method = require('./method'),
    fetchFollowers = require('./fetchFollowers');

module.exports = function(models) {
    return method(models, checkSubscription)
};

function checkSubscription(instagramNickname) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    return new Promise((resolve, reject) => {

        InstagramFollowers
            .findOne({ instagramNickname }, function(err, instFollower) {
                if(!!err) { return reject(err) }

                if(!!instFollower == false) { return resolve(false) }

                let { instagramNickname, cursor } = instFollower;

                console.log('InstagramFollower: %o | %o', instagramNickname, cursor);

                if(!cursor) { return resolve(true) }

                fetchFollowers(false, cursor)
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
                    })
            })

    })
}