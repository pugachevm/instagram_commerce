module.exports = function(mongoose) {
    
    let Schema = mongoose.Schema;

    let Users = require('./Users')(Schema),
        Scores = require('./Scores')(Schema);
    
    return {
        Users: mongoose.model('Users', Users),
        Scores: mongoose.model('Scores', Scores),
        _Schema: Schema
    }

}