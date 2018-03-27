let method = require('./method');

module.exports = function(models) {
    return method(models, updateFollower)
};

function updateFollower(follower) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    let { instagramId } = follower;

    return new Promise((resolve, reject) => {
        InstagramFollowers.findOne({ instagramId }, (err, user) => {
            if(!!err) { return reject(err) }

            user = !!user ? user : new InstagramFollowers({ follower });

            if(!instagramId) { return reject(new Error('Wrong Instagram Id')) }

            //console.log('\x1b[32m%s\x1b[0m %o', 'InstagramFollower:', user);

            user.save(err => {
                if(!!err) { console.log('\x1b[32m%s\x1b[0m %o', user); return reject(err) }

                return resolve(user)
            })
        });
    })
}