let method = require('./method'),
    constants = require('../constants');

const {
    MAIN_INSTAGRAM_REWARD,
    REWARD_FOR_INIT,
    REWARD_FOR_INSTAGRAM,
    REWARD_FOR_INVITATION_INIT,
    REWARD_FOR_INIVITATION_INSTAGRAM,
    REWARD_FOR_INVITATION_AMOUNT
} = constants;

module.exports = function(models) {
    return method(models, getUserPoints)
};

function getUserPoints(userData) {
    let models = this,
        { Users, Scores } = models;

    return new Promise((resolve, reject) => {

        Users
            .findOne(userData)
            .populate({ path: 'scores', model: 'Scores' })
            .exec((err, user) => {
                if(!!err) { return reject(err) }

                if(!!user == false || !!user.scores == false) { return reject(null)}

                Scores.populate(user.scores, { path: 'friendsInvitations', model: 'Users' }, (err, scores) => {
                    if(!!err) { return reject(err) }

                    if(!!scores == false) { return reject(new Error('Unexpected error while populating friends invitations')) }

                    let { initAction, instagramSubscriptions, friendsInvitations } = scores;

                    let scoresToCount = {
                        initAction: initAction,
                        instagramSubscriptions: instagramSubscriptions,
                        friendsInvitations: []
                    };

                    populateFriends.call({ Users }, friendsInvitations)
                        .then(friendsInvitations => {
                            scoresToCount.friendsInvitations = friendsInvitations;

                            return countPoints(scoresToCount)
                        })
                        .then(preCountedPoints => {
                            let _preCountedPoints = 0;
                            Object.keys(preCountedPoints).map(key => {
                                _preCountedPoints += preCountedPoints[key]
                            });

                            user.preCountedPoints = _preCountedPoints;

                            user.save(err => {
                                if(!!err) { return reject(err) }

                                return resolve(preCountedPoints)
                            })
                        })
                })
            })

    })
}

function populateFriends(friendsInvitations) {
    let { Users } = this,
        result = [];

    return new Promise((resolve, reject) => {

        function addFriend(scores, isEnd) {
            result.push(scores);

            if(isEnd) {
                return resolve(result)
            }
        }

        if(!friendsInvitations || !friendsInvitations.length) {
            return resolve(result)
        }

        friendsInvitations.forEach((user, i) => {
            let isEnd = i == friendsInvitations.length - 1;

            Users.populate(user, { path: 'scores', model: 'Scores' }, (err, friend) => {
                let friendPopulatedScores = {
                        initAction: false,
                        instagramSubscription: false
                    };

                if(!!err) { return addFriend(friendPopulatedScores, isEnd) }
                if(!!friend == false) { return addFriend(friendPopulatedScores, isEnd) }

                let friendScores = friend.scores || {};

                let { initAction, instagramSubscriptions, friendsInvitations } = friendScores;

                friendPopulatedScores.initAction = initAction;
                friendPopulatedScores.instagramSubscription = instagramSubscriptions ? !!instagramSubscriptions.filter(item => item == MAIN_INSTAGRAM_REWARD).shift() : false;

                return addFriend(friendPopulatedScores, isEnd)
            })
        })
    })
}

function countPoints({ initAction, instagramSubscriptions, friendsInvitations }) {
    let points = {
            initAction: 0,
            instagramSubscriptions: 0,
            friendsInvitations: 0,
            returnable: 0
        };

    if(initAction) {
        points.initAction += REWARD_FOR_INIT
    }

    if(initAction && instagramSubscriptions && instagramSubscriptions.length) {
        instagramSubscriptions.forEach(item => { points.instagramSubscriptions += REWARD_FOR_INSTAGRAM })
    }

    if(friendsInvitations && friendsInvitations.length) {
        friendsInvitations.forEach(item => {
            let { initAction, instagramSubscription } = item;

            if(initAction) {
                points.friendsInvitations += REWARD_FOR_INVITATION_INIT;
            }

            if(initAction && instagramSubscription) {
                points.friendsInvitations += REWARD_FOR_INIVITATION_INSTAGRAM;
            }
        });

        points.returnable += friendsInvitations.length * REWARD_FOR_INVITATION_AMOUNT;// 0.1 per each friend
    }

    return points
}