var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , BasicStrategy = require('passport-http').BasicStrategy
    , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
    , BearerStrategy = require('passport-http-bearer').Strategy
    , db = require('./db').db()
    , bcrypt = require('bcrypt')
    , crypto = require('crypto')

/**
 * This strategy is used to authenticate a user based on the username and password
 * This strategy is only used when exchanging an access token for the username and password
 */
passport.use('userLocal', new LocalStrategy(
    function (username, password, done) {
        db.collection('users').findOne({username: username}, function (err, user) {
            if (err) return done(err)
            if (!user) return done(null, false)
            bcrypt.compare(password, user.password, function (err, res) {
                if (res) return done(null, user)
                else return done(null, false);
            })
        })
    }
))

/**
 * These strategies are used to authenticate registered OAuth clients.
 * The authentication data may be delivered using the basic authentication scheme (recommended)
 * or the client strategy, which means that the authentication data is in the body of the request.
 */
passport.use("clientBasic", new BasicStrategy(
    function (clientId, clientSecret, done) {
        db.collection('clients').findOne({clientId: clientId}, function (err, client) {
            if (err) return done(err)
            if (!client) return done(null, false)
            if (!client.trustedClient) return done(null, false)

            if (client.clientSecret == clientSecret) return done(null, client)
            else return done(null, false)
        });
    }
));

passport.use("clientPassword", new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        db.collection('clients').findOne({clientId: clientId}, function (err, client) {
            if (err) return done(err)
            if (!client) return done(null, false)
            if (!client.trustedClient) return done(null, false)

            if (client.clientSecret == clientSecret) return done(null, client)
            else return done(null, false)
        });
    }
));

/**
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).
 */
passport.use("accessToken", new BearerStrategy(
    function (accessToken, done) {
        var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex')
        db.collection('accessTokens').find({accessToken: accessTokenHash}, function (err, token) {
            if (err) return done(err)
            if (!token) return done(null, false)
            if (new Date() > token.expirationDate) {
                db.collection('accessTokens').delete({accessToken: accessTokenHash}, function (err) { return done(err) })
            }

            db.collection('users').findOne({username: token.userId}, function (err, user) {
                if (err) return done(err)
                if (!user) return done(null, false)
                // no use of scopes for no
                var info = { scope: '*' }
                done(null, user, info);
            });
        });
    }
))