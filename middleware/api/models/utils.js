module.exports = function(Schema) {
    return {
        Pointer: function Pointer(model, required, unique) {
            return {
                type: Schema.Types.ObjectId,
                required: !!required,
                ref: model,
                unique: !!unique
            }
        }
    }
};