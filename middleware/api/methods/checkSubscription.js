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

    const FOLLOWER_FETCH_TIMEOUT_APPRX = 3600 * 24 * (1 / 2) * 1000;

    return new Promise((resolve, reject) => {

        InstagramFollowers
            .findOne({ instagramNickname }, function (err, instFollower) {
                if (!!err) { return reject(err) }

                if (!!instFollower == false) {
                    console.log('Follower NOT FOUND')
                    return findFollowerFromLastFollowers.call(models, fetchFollowers, instagramNickname)
                        .then(follower => {
                            let instagramNickname = !!follower ? follower.node.username : null;
                            console.log('FETCHED NICK: %o', instagramNickname);
                            return updateUserSubscription.call(models, setUserPoints, instagramNickname)
                        })
                        .then(resolve)
                        .catch(reject)
                }

                let { instagramNickname, cursor, updatedAt } = instFollower;

                //if (!cursor) { return resolve(true) }

                let _currentTimestamp = +(new Date()),
                    _updatedTimestamp = +(new Date(updatedAt));

                if (_currentTimestamp - _updatedTimestamp >= FOLLOWER_FETCH_TIMEOUT_APPRX) {
                    return findFollowerFromLastFollowers.call(models, fetchFollowers, instagramNickname)
                        .then(follower => {
                            let instagramNickname = !!follower ? follower.node.username : null;

                            console.log('FETCHED NICK: %o', instagramNickname);
                            return updateUserSubscription.call(models, setUserPoints, instagramNickname)
                        })
                        .then(resolve)
                        .catch(reject)
                }

                console.log('User auto-updating')

                return updateUserSubscription.call(models, setUserPoints, instagramNickname)
                    .then(resolve)
                    .catch(reject)
            })

    })
}

function findFollowerFromLastFollowers(fetchFollowers, instagramNickname) {
    let models = this;

    return new Promise((resolve, reject) => {
        fetchFollowers(false, null)
            .then(followers => {
                followers = followers || [];
                console.log('COUNT: %o', followers.length);

                return resolve(followers.filter(node => !!node ? instagramNickname == node.node.username : false).shift())
            })
            .catch(reject)
    })
}

function updateUserSubscription(setUserPoints, instagramNickname) {
    let { Users } = this;

    return new Promise((resolve, reject) => {
        if(!!instagramNickname == false) { return resolve(false) }

        return Users.findOne({ instagramNickname }, (err, user) => {
            if (!!err) { return resolve(false) }
            if (!!user == false) { return resolve(false) }
    
            let { telegramNickname } = user;
    
            return setUserPoints(telegramNickname, { instagram: 'pugachevmark' })
                .then(() => { return resolve(true) })
                .catch(reject)
        })
    })
}