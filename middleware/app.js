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

    let { signIn, subscribeMiddleware } = callbacks;

    const PASSPORT_INSTAGRAM_CONFIG = {
        clientID: INSTAGRAM_CLIENT_ID,
        clientSecret: INSTAGRAM_CLIENT_SECRET,
        callbackURL: [
            proto + '://',
            domain,
            (port == 3000 ? ':'+ port : ''),
            URL_AUTH_CALLBACK
        ].join(''),
        scope: ['relationships', 'follower_list'],
        passReqToCallback: true
    };

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    passport.use(new InstagramStrategy(PASSPORT_INSTAGRAM_CONFIG,
        (req, accessToken, refreshToken, profile, done) => {
            let { chatId } = req.session;

            process.nextTick(() => {
                done(null, profile);

                return signIn({
                    chatId,
                    accessToken,
                    profile
                })
            });
        }
    ));


    router.get('/', (req, res) => {
        res.end();
    });

    router.get(URL_SUBSCRIBE, (req, res) => {console.log('Subscription requested')
        subscribeMiddleware();
        res.writeHead(302, { 'Location': 'https://www.instagram.com/pugachevmark/' });
        res.end();
    });

    router.get(URL_AUTH, (req, res, next) => {
        // do
        let { chatId } = req.query;
        req.session.chatId = chatId;

        passport.authenticate('instagram', {
            scope: ['relationships', 'follower_list']
        })(req, res, next);
    });

    router.get(URL_AUTH_CALLBACK, (req, res, next) => {
        let { chatId } = req.session;

        passport.authenticate('instagram', {
            failureRedirect: URL_AUTH
        })(req, res, next)
    }, (req, res) => {
        res.writeHead(302, { 'Location': '/authorized' });
        res.end();
    });

    router.get(URL_LOGOUT, (req, res) => {
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

    app.listen(port, () => {
        console.log('Server started at %o:%o', domain, port)
    });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }
};

function checkSubscription(callback) {

    let _to = setTimeout(() => {
        clearTimeout(_to);

        callback();
    }, 60000);
}