let Utils = require('./utils');

module.exports = function(Schema) {

    utils = Utils(Schema);

    const Pointer = utils.Pointer;

    return new Schema({
        instagramId: { type: Number, unique: true },
        instagramNickname: { type: String },
        updatedAt: { type: Date, default: Date.now, required: true },
        createdAt: { type: Date, default: Date.now, required: true }
    })

}