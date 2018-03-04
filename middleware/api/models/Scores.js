var Utils = require('./utils');

module.exports = function(Schema) {

    utils = Utils(Schema);

    const Pointer = utils.Pointer;

    return new Schema({
        initAction: { type: Boolean },
        instagramSubscriptions: [Schema.Types.Mixed],
        friendsInvitations: [(new Pointer('Users'))]
    })

}