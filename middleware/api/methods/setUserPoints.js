let method = require('./method'),
    isHashExists = require('../../../utils/isHashExists');

module.exports = (models) => {
    return method(models, setUserPoints)
};

function setUserPoints(nickname, args) {
    let models = this,
        Users = models.Users,
        Scores = models.Scores;

    return new Promise((resolve, reject) => {
        let query = { telegramNickname: nickname },
            scores = null;

        Users.findOne(query, (err, user) => {
            if (!!err) { return reject(err) }

            if (!!user == false) { return reject(new Error('User not found')) }

            let { friend, instagram } = args,
                { invitedBy } = user;

            if (!!invitedBy) {
                friend = null;
            }

            Users.populate(user, { path: 'scores', model: 'Scores' }, (err, user) => {
                if (!!err) { return reject(err) }

                let { scores } = user,
                    userId = user._id;

                findMaster.call(models, { telegramNickname: friend }, userId)
                    .then(master => {
                        let masterId = !!master ? master._id : null,
                            scoreId = !!scores ? scores._id : null;

                        return addPoints.call(models, scoreId, { instagram })
                            .then(score => {
                                user.scores = score._id;
                                !!masterId && (user.invitedBy = masterId);

                                user.save(err => {
                                    if (!!err) { return reject(err) }

                                    return resolve(user)
                                })
                            })
                            .catch(reject)
                    })
                    .catch(reject)
            })
        })

    })
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

                addPoints.call({ Users, Scores },
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

function addPoints(scoreId, { friend, instagram }) {
    let { Scores } = this,
        query = { _id: scoreId },
        defaultScore = { initAction: false, instagramSubscriptions: [], friendsInvitations: [] };

    return new Promise((resolve, reject) => {
        Scores.findOne(query, (err, score) => {
            if (!!err) { return reject(err) }

            score = !!score ? score : new Scores(defaultScore);

            score.initAction = score.initAction || !!instagram;// depends from any instagram subscription
            !!instagram && !isHashExists(score.instagramSubscriptions, instagram) && score.instagramSubscriptions.push(instagram);
            !!friend && !isHashExists(score.friendsInvitations, friend._id) && score.friendsInvitations.push(friend);

            score.save(err => {
                if (!!err) { return reject(err) }

                return resolve(score)
            })
        })
    })
}