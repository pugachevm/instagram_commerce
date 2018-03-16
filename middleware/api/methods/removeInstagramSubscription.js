let method = require('./method');

module.exports = (models) => {
    return method(models, removeInstagramSubscription)
};

function removeInstagramSubscription(userNickname, masterNickname) {
    let models = this,
        Users = models.Users,
        Scores = models.Scores;

    return new Promise((resolve, reject) => {

        Users.findOne({ instagramNickname: userNickname }, (err, user) => {
            if(!!err) { return reject(err) }

            if(!!user == false) { return reject(new Error('user not found')) }

            Users.populate(user, { path: 'scores', model: 'Scores' }, (err, user) => {

                let { scores } = user;

                if(!scores || !scores._id) { return reject(new Error('User not authorized')) }

                let { instagramSubscriptions } = scores;

                scores.instagramSubscriptions = instagramSubscriptions.filter(item => item != masterNickname);

                scores.save((err) => {
                    if(!!err) { return reject(err) }

                    return resolve(user)
                })
            })
        });
    })
}