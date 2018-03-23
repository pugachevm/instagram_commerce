let method = require('./method');

module.exports = function(models) {
    return method(models, updateFollower)
};

function updateFollower(follower) {//console.log('follower: %o', follower.instagramNickname);
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    let { instagramId } = follower;

    return new Promise((resolve, reject) => {
        InstagramFollowers.findOne({ instagramId }, (err, user) => {//console.log('_id: %o', !!user ? user._id : null);
            if(!!err) { return reject(err) }

            user = !!user ? user : new InstagramFollowers({ follower });

            //console.log('\x1b[32m%s\x1b[0m %o', 'InstagramFollower:', user);

            user.save(err => {
                if(!!err) { return reject(err)}

                return resolve(user)
            })
        });
    })
}