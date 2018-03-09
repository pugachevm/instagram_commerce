module.exports = function(mongoose) {
    
    let Schema = mongoose.Schema;

    return {
        Users: mongoose.model('Users', require('./Users')(Schema)),
        Scores: mongoose.model('Scores', require('./Scores')(Schema)),
        InstagramFollowers: mongoose.model('InstagramFollowers', require('./InstagramFollowers')(Schema)),
        _Schema: Schema
    }

}