module.exports = declOf;

function declOf(titles) {
    var cases = [2, 0, 1, 1, 1, 2];

    return function (number) {
        number = Math.abs(number);

        return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]];
    };
}