let Utils = require('./utils');

module.exports = function(Schema) {

    let utils = Utils(Schema);

    const Pointer = utils.Pointer;

    return new Schema({
        telegramId: { type: Number, unique: true },
        instagramId: { type: Number },
        telegramNickname: { type: String },
        instagramNickname: { type: String },
        firstName: { type:String },
        lastName: { type: String },
        banned: { type: Boolean },
        scores: (new Pointer('Scores')),
        invitedBy: (new Pointer('Users')),
        chatId: { type: Number, unique: true },
        preCountedPoints: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now, required: true },
        createdAt: { type: Date, default: Date.now, required: true }
    })

};