var oauth2orize = require('oauth2orize')
    , passport = require('passport')
    , db = require('db').db()
    , crypto = require('crypto')
    , utils = require("./utils")

// create OAuth 2.0 server
var server = oauth2orize.createServer();

//Resource owner password
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
    var token = utils.uid(256)
    var refreshToken = utils.uid(256)
    var tokenHash = crypto.createHash('sha1').update(token).digest('hex')
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')
    
    var expirationDate = new Date(new Date().getTime() + (3600 * 1000))

    db.collection('accessTokens').save({token: tokenHash, refreshToken: refreshTokenHash, expirationDate: expirationDate, clientId: client._id, userId: username, scope: scope}, function (err) {
        if (err) return done(err)
        done(null, token, refreshToken, {expires_in: expirationDate})
    })
}))

//Refresh Token
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    var token = utils.uid(256)
    
    var tokenHash = crypto.createHash('sha1').update(token).digest('hex')
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')
    
    var expirationDate = new Date(new Date().getTime() + (3600 * 1000))

    db.collection('accessTokens').update({refreshToken: refreshTokenHash}, {token: tokenHash, scope: scope, expirationDate: expirationDate}, function (err) {
        if (err) return done(err)
        done(null, token, refreshToken, {expires_in: expirationDate});
    })
}))

// token endpoint
exports.token = [
    passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
    passport.authenticate('userLocal', { session: false }),
    server.token(),
    server.errorHandler()
]

