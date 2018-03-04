let fs = require('fs');

module.exports = function(models) {
    let methodsList = JSON.parse(fs.readFileSync('./middleware/api/methods/list.json', 'utf-8')),
        methods = {};

    methodsList.forEach(function(method) {
        methods[method] = includeMethod(method, models)
    })

    return methods
}

function includeMethod(name, models) {
    return require(['.', name].join('/'))(models)
}