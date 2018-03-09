let method = require('./method');

module.exports = function(models) {
    return method(models, updateFollower)
};

function updateFollower(follower) {console.log('follower: %o', follower.instagramNickname)
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    return new Promise((resolve, reject) => {
        InstagramFollowers.findOneAndUpdate(follower, { $set: follower }, { upsert: true }, (err, user) => {
            if(!!err) { return reject(err) }
    
            user = !!user ? user : new InstagramFollowers({ $set: follower });
    
            user.save(err => {
                if(!!err) { reject(err)}

                return resolve(user)
            })
        });
    })
}