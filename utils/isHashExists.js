module.exports = function(arr, hash) {
    return !!arr.find(function(f) {
        return !!JSON.stringify(f).match(new RegExp(hash, 'i'))
    })
};