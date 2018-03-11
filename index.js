let mongoose = require('mongoose'),
    fs = require('fs'),
    Init = require('./src/index');

const URI_MONGO = fs.readFileSync('mongodb.config', 'utf-8');

//get started
mongoose
    .connect(URI_MONGO);

let instagram_commerce_db = mongoose.connection;

instagram_commerce_db
    .on('error', console.error);

instagram_commerce_db
    .once('open', Init.bind(mongoose));
