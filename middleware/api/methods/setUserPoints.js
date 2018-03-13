let method = require('./method'),
    isHashExists = require('../../../utils/isHashExists');

module.exports = (models) => {
    return method(models, setUserPoints)
};

function setUserPoints(nickname, args) {
    let models = this,
        Users = models.Users,
        Scores = models.Scores;

    return new Promise(function (resolve, reject) {
        let query = { telegramNickname: nickname },
            scores = null;

        Users.findOne(query, {}, { upsert: true }, function (err, user) {
            if (!!err) { return reject(err) }

            if (!!user == false) { return reject(new Error('User not found')) }

            let { friend, instagram } = args;

            Users.populate(user, { path: 'scores', model: 'Scores' }, function (err, user) {
                if (!!err) { return reject(err) }

                let { scores } = user,
                    userId = user._id;

                findMaster.call({ Users, Scores }, { telegramNickname: friend }, userId)
                    .then(function(master) {
                        let masterId = !!master ? master._id : null,
                            scoreId = !!scores ? scores._id : null;

                        return addPoints.call({ Scores },
                            scoreId,
                            { instagram })
                            .then(function(score) {
                                user.scores = score._id;
                                !!masterId && (user.invitedBy = masterId);
        
                                user.save(function(err) {
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

function findMaster(query, invitedId) {
    let { Users, Scores } = this;

    return new Promise(function(resolve, reject) {
        if (!invitedId) { return resolve(null) }

        Users.findOne(query).populate({ path: 'scores', model: 'Scores' })
            .exec(function(err, master) {
                if (!!err) { return reject(err) }

                if (!!master == false) { return resolve(null) }

                let { scores } = master,
                    scoreId = !!scores ? scores._id : null;

                addPoints.call({ Scores },
                    scoreId,
                    {
                        friend: (!!invitedId ? { _id: invitedId } : null)
                    })
                    .then(function(score) {
                        let scoreId = score._id;

                        master.scores = scoreId;

                        master.save(function(err) {
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
        query = { _id: scoreId },
        defaultScore = { initAction: true, instagramSubscriptions: [], friendsInvitations: [] };

    return new Promise(function(resolve, reject) {
        Scores.findOne(query, function(err, score) {
            if (!!err) { return reject(err) }

            score = !!score ? score : new Scores(defaultScore);

            score.initAction = true;
            !!instagram && !isHashExists(score.instagramSubscriptions, instagram) && score.instagramSubscriptions.push(instagram);
            !!friend && !isHashExists(score.friendsInvitations, friend._id) && score.friendsInvitations.push(friend);

            score.save(function(err) {
                if (!!err) { return reject(err) }

                return resolve(score)
            })
        })
    })
}