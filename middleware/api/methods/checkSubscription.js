let method = require('./method'),
    _fetchFollowers = require('./fetchFollowers'),
    _setUserPoints = require('./setUserPoints');

module.exports = function (models) {
    return method(models, checkSubscription)
};

function checkSubscription(instagramNickname) {
    let models = this,
        { Users, InstagramFollowers } = models,
        fetchFollowers = _fetchFollowers(models),
        setUserPoints = _setUserPoints(models);

    const FOLLOWER_FETCH_TIMEOUT_APPRX = 3600 * 24 * (1 / 12) * 1000;

    return new Promise((resolve, reject) => {

        InstagramFollowers
            .findOne({ instagramNickname }, function (err, instFollower) {
                if (!!err) { return reject(err) }

                if (!!instFollower == false) { return resolve(false) }

                let { instagramNickname, cursor, updatedAt } = instFollower;

                //if (!cursor) { return resolve(true) }

                let _currentTimestamp = +(new Date()),
                    _updatedTimestamp = +(new Date(updatedAt));

                if (_currentTimestamp - _updatedTimestamp >= FOLLOWER_FETCH_TIMEOUT_APPRX) {
                    return fetchFollowers(false, null)
                        .then(followers => {
                            followers = followers || [];console.log('COUNT: %o', followers.length);

                            followers.forEach((node, i) => {
                                let follower = node.node;

                                console.log('follower: %o', instagramNickname)//follower.username);

                                if (instagramNickname == follower.username) {
                                    console.log('found follower: %o', instagramNickname)
                                    return Users.findOne({ instagramNickname }, (err, user) => {
                                        console.log('user: %o', user);
                                        if (!!err) { return reject(false) }
                                        if (!!user == false) { return reject(false) }

                                        let { telegramNickname } = user;

                                        return setUserPoints(telegramNickname, { instagram: 'pugachevmark' })
                                            .then(resolve)
                                            .catch(reject)
                                    })
                                }

                                if (i >= followers.length - 1) {
                                    console.log('end of fetching %o', i)
                                    return resolve(false)
                                }
                            })
                        })
                }

                console.log('User auto-updating')

                return Users.findOne({ instagramNickname }, (err, user) => {
                    console.log('user: %o', user);
                    if (!!err) { return reject(false) }
                    if (!!user == false) { return reject(false) }

                    let { telegramNickname } = user;

                    return setUserPoints(telegramNickname, { instagram: 'pugachevmark' })
                        .then(resolve)
                        .catch(reject)
                })
            })

    })
}