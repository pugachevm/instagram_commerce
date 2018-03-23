let express = require('express'),
    passport = require('passport'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    serveStatic = require('serve-static'),
    cookie = require('cookie'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    InstagramStrategy = require('passport-instagram').Strategy;

let app = express(),
    router = express.Router();

const CREDENTIALS = JSON.parse(fs.readFileSync('middleware/creds.json', 'utf-8'));
const PATHMAP = JSON.parse(fs.readFileSync('middleware/path-map.json', 'utf-8'));

const STATIC_PUBLIC_STORAGE = path.join(__dirname, 'static', 'public');
const STATIC_PRIVATE_STORAGE = path.join(__dirname, 'static', 'private');

const INSTAGRAM_CLIENT_ID = CREDENTIALS.instagram_cliendId;
const INSTAGRAM_CLIENT_SECRET = CREDENTIALS.instagram_token;

const URL_AUTH = PATHMAP.signIn;
const URL_LOGOUT = PATHMAP.signOut;
const URL_AUTH_CALLBACK = PATHMAP.signInCallback;
const URL_SUBSCRIBE = PATHMAP.subscribe;
const URL_SUBSCRIBE_CALLBACK = PATHMAP.subscribeCallback;

module.exports = function (proto, domain, port, callbacks) {

    let { signIn } = callbacks;

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new InstagramStrategy({
        clientID: INSTAGRAM_CLIENT_ID,
        clientSecret: INSTAGRAM_CLIENT_SECRET,
        callbackURL: [
            proto + '://',
            domain,
            (port == 3000 ? ':'+ port : ''),
            URL_AUTH_CALLBACK
        ].join(''),
        scope: ['relationships', 'follower_list']
    },
        function (accessToken, refreshToken, profile, done) {

            process.nextTick(function () {

                done(null, profile);

                return signIn({
                    accessToken: accessToken,
                    profile: profile
                })
            });
        }
    ));


    router.get('/', function (req, res) {
        //res.writeHead(302, { 'Location': URL_SUBSCRIBE });
        res.end();
    });

    router.get('/test', function(req, res) {
        console.log('IP: %o', getCallerIP(req));
        res.end();

        function getCallerIP(request) {
            var ip = request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress;
            ip = ip.split(',')[0];
            ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
            return ip;
        }
    });

    router.get(URL_SUBSCRIBE, function(req, res) {
        //res.sendFile([ STATIC_PRIVATE_STORAGE, 'subscribe', 'index.html' ].join('/'))
        res.writeHead(200, { 'Location': 'https://www.instagram.com/pugachevmark/' });
        res.end();
    });

    router.get(URL_AUTH, passport.authenticate('instagram', { scope: ['relationships', 'follower_list'] }), function (req, res) {
        // do
        console.log('Auth uri executed')
    });

    router.get(URL_AUTH_CALLBACK, passport.authenticate('instagram', { failureRedirect: URL_AUTH }), function (req, res) {
        console.log('Auth callback uri executed');

        /*res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<script>window.close()</script>');
        res.end();*/
        res.writeHead(302, { 'Location': 'https://www.instagram.com/pugachevmark/' });
        res.end();
    });

    router.get(URL_LOGOUT, function(req, res) {
        req.logout();
        res.redirect('/');
    });


    //defaults
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(this.sessionParser({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/', (req, res, next) => { serveStatic(STATIC_PUBLIC_STORAGE, { 'index': [ 'index.html', 'index.htm' ] })(req, res, next) });

    app.use('/', router);

    app.listen(port, function () {
        console.log('Server started at %o:%o', domain, port)
    });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }
};

function checkSubscription(callback) {

    let _to = setTimeout(function() {
        clearTimeout(_to);

        callback();
    }, 60000);
}