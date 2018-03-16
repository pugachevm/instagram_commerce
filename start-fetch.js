let mongoose = require('mongoose'),
    fs = require('fs'),
    Api = require('./middleware/api');

const URI_MONGO = fs.readFileSync('mongodb.config', 'utf-8');

//get started
mongoose
    .connect(URI_MONGO);

let instagram_commerce_db = mongoose.connection;

instagram_commerce_db
    .on('error', console.error);

instagram_commerce_db
    .once('open', function() {

        let api = Api(mongoose);

        fetchLoop(api.method);// automatically fetches the followers till the end :)
    });

function fetchLoop($api)
{
    const LOOP_TIMEOUT = 0;//3600 * 24 * (1/288) * 1000;// = 30 mins

    let _to = setTimeout(function() {
        clearTimeout(_to);

        $api.fetchFollowers(false);

        fetchLoop($api);
    }, LOOP_TIMEOUT);
}