let method = require('./method');

module.exports = function(models) {
    return method(models, updateFollower)
};

function updateFollower(follower) {//console.log('    follower: %o', follower);
    let models = this,
        InstagramFollowers = models.InstagramFollowers;

    return new Promise((resolve, reject) => {
        InstagramFollowers.findOneAndUpdate(follower, { $set: follower }, { upsert: true }, (err, user) => {
            if(!!err) { return reject(err) }
    
            user = !!user ? user : new InstagramFollowers({ $set: follower });

            //console.log('\x1b[32m%s\x1b[0m %o', 'InstagramFollower:', user);

            user.save(err => {
                if(!!err) { return reject(err)}

                return resolve(user)
            })
        });
    })
}