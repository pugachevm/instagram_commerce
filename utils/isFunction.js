module.exports = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};