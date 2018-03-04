let method = require('./method'),
    isHashExists = require('../../../utils/isHashExists');

module.exports = (models) => {
    return method(models, setUserPoints)
}

function setUserPoints(nickname, args) {
    let models = this,
        Users = models.Users,
        Scores = models.Scores;

    return new Promise(function (resolve, reject) {
        let query = { telegramNickname: nickname },
            scores = null;

        Users.findOneAndUpdate(query, {}, { upsert: true }, (err, user) => {
            if (!!err) { return reject(err) }

            if (!!user == false) { return reject(new Error('User not found')) }

            let { friend, instagram } = args;

            Users.populate(user, { path: 'scores', model: 'Scores' }, (err, user) => {
                if (!!err) { return reject(err) }

                let { scores } = user,
                    userId = user._id;

                findMaster.call({ Users, Scores }, { telegramNickname: friend }, userId)
                    .then(master => {
                        let masterId = !!master ? master._id : null,
                            scoreId = !!scores ? scores._id : null;

                        return addPoints.call({ Scores }, scoreId, {
                            instagram: instagram
                        })
                            .then(score => {
                                user.scores = score._id;
                                !!masterId && (user.invitedBy = masterId);
        
                                user.save((err) => {
                                    console.log('End error: %o', err)
                                    if (!!err) { return reject(err) }
        
                                    return resolve(user)
                                })
                            })
                    })
                    .catch(reject)
            })
        })

    })
}

function mergeSubscriptions(subscriptions, newSubscription) {
    if (!!newSubscription == false) {
        return subscriptions || []
    }

    if (!!subscriptions == false) {
        return [].push(newSubscription)
    }

    return subscriptions.push(newSubscription)
}

function findMaster(query, invitedId) {
    let { Users, Scores } = this;

    return new Promise((resolve, reject) => {
        if (!invitedId) { return resolve(null) }

        Users.findOne(query).populate({ path: 'scores', model: 'Scores' })
            .exec((err, master) => {
                if (!!err) { return reject(err) }

                if (!!master == false) { return resolve(null) }

                let { scores } = master,
                    scoreId = !!scores ? scores._id : null;

                return addPoints.call({ Scores },
                    scoreId,
                    {
                        friend: (!!invitedId ? { _id: invitedId } : null)
                    })
                    .then(score => {
                        let scoreId = score._id;

                        master.scores = scoreId;

                        master.save(err => {
                            if (!!err) { return reject(err) }

                            return resolve(master);
                        })
                    })
                    .catch(reject)
            })
    })
}

function addPoints(scoreId, update) {
    let { Scores } = this,
        { friend, instagram } = update,
        query = !!scoreId ? { _id: scoreId } : {};

    return new Promise((resolve, reject) => {
        Scores.findOneAndUpdate(query, {}, { upsert: true }, (err, score) => {
            if (!!err) { return reject(err) }

            Scores.populate(score, { path: 'friendsInvitations', model: 'Users' }, (err, score) => {
                if (!!err) { return reject(err) }

                score = !!score ? score : new Scores();

                score.initAction = true;
                !!instagram && !isHashExists(score.friendsInvitations, instagram) && score.instagramSubscriptions.push(instagram);
                !!friend && !isHashExists(score.friendsInvitations, friend) && score.friendsInvitations.push(friend);

                score.save((err) => {
                    console.error('Error: %o', err);
                    if (!!err) { return reject(err) }

                    return resolve(score)
                })
            })
        })
    })
}