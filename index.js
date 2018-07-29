let mongoose = require('mongoose'),
    fs = require('fs'),
    Init = require('./src/index');

const URI_MONGO = fs.readFileSync('mongodb.config', 'utf-8');

console.log('URL: %o', URI_MONGO);

//get started
try {
    mongoose
        .connect(URI_MONGO);
} catch(e) {
    console.error('Error: %o', e);
}

let instagram_commerce_db = mongoose.connection;

instagram_commerce_db
    .on('error', console.error);

instagram_commerce_db
    .once('open', Init.bind(mongoose));
