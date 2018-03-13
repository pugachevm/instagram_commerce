module.exports = function(Schema) {
    return {
        Pointer: function Pointer(model, required) {
            return {
                type: Schema.Types.ObjectId,
                required: !!required,
                ref: model,
                unique: true
            }
        }
    }
}