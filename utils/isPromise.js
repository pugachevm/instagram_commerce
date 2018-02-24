module.exports = function(obj) {
    return obj && !!Object.prototype.toString.call(obj).match(/promise/i)
};