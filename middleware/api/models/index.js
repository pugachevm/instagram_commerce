module.exports = function(mongoose) {
    
    var Schema = mongoose.Schema;

    var Users = require('./Users')(Schema),
        Scores = require('./Scores')(Schema);
    
    return {
        Users: mongoose.model('Users', Users),
        Scores: mongoose.model('Scores', Scores)
    }

}