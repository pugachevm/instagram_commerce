var express = require('express'),
    passport = require('passport'),
    fs = require('fs'),
    util = require('util'),
    cookie = require('cookie'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    InstagramStrategy = require('passport-instagram').Strategy;

var app = express(),
    router = express.Router();

var CREDENTIALS = JSON.parse(fs.readFileSync('middleware/creds.json', 'utf-8')),
    PATHMAP = JSON.parse(fs.readFileSync('middleware/path-map.json', 'utf-8'));

const INSTAGRAM_CLIENT_ID = CREDENTIALS.instagram_cliendId;
const INSTAGRAM_CLIENT_SECRET = CREDENTIALS.instagram_token;

const URL_AUTH = PATHMAP.signIn;
const URL_LOGOUT = PATHMAP.signOut;
const URL_AUTH_CALLBACK = PATHMAP.signInCallback;
const URL_SUBSCRIBE = PATHMAP.subscribe;
const URL_SUBSCRIBE_CALLBACK = PATHMAP.subscribeCallback;

module.exports = function (proto, domain, port, signInCallback, subscribeCallback) {

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

                return signInCallback({
                    accessToken: accessToken,
                    profile: profile
                })
            });
        }
    ));


    router.get('/', function (req, res) {
        res.send('Hello ' + req.isAuthenticated());
    });

    router.get(URL_SUBSCRIBE, function(req, res) {
        subscribeCallback();
        res.writeHead(302, { 'Location': 'https://www.instagram.com/pugachevmark/'});
        res.end();
    })

    router.get(URL_AUTH, passport.authenticate('instagram', { scope: ['relationships', 'follower_list'] }), function (req, res) {
        // do
        console.log('Auth uri executed')
    });

    router.get(URL_AUTH_CALLBACK, passport.authenticate('instagram', { failureRedirect: URL_AUTH }), function (req, res) {

        console.log('Auth callback uri executed');

        res.send('<script>window.close()</script>');
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

    app.use('/', router);

    app.listen(port, function () {
        console.log('Server started at %o:%o', domain, port)
    });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }
};