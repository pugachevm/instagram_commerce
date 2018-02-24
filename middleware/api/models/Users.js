var Utils = require('./utils');

module.exports = function(Schema) {

    utils = Utils(Schema);

    const Pointer = utils.Pointer;

    return new Schema({
        telegramId: { type: Number, unique: true },
        instagramId: { type: Number, unique: true },
        telegramNickname: { type: String },
        instagramNickname: { type: String },
        firstName: { type:String },
        lastName: { type: String },
        banned: { type: Boolean },
        scores: (new Pointer('Scores')),
        invitedBy: (new Pointer('Users')),
        chatId: { type: Number, unique: true }
    })

};