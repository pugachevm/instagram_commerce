module.exports = function(models, controller) {
    return function() {
        return controller.apply(models, arguments)
    }
};