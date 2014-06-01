var oauth2orize = require('oauth2orize')
    , passport = require('passport')
    , db = require('./db').db()
    , crypto = require('crypto')
    , utils = require("./utils")
    , bcrypt = require('bcrypt')

// create OAuth 2.0 server
var server = oauth2orize.createServer();

//Resource owner password
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
    db.collection('users').findOne({username: username}, function (err, user) {
        if (err) return done(err)
        if (!user) return done(null, false)
        bcrypt.compare(password, user.password, function (err, res) {
            if (!res) return done(null, false)
            
            var token = utils.uid(256)
            var refreshToken = utils.uid(256)
            var tokenHash = crypto.createHash('sha1').update(token).digest('hex')
            var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')
            
            var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
        
            db.collection('accessTokens').save({token: tokenHash, expirationDate: expirationDate, clientId: client.clientId, userId: username, scope: scope}, function (err) {
                if (err) return done(err)
                db.collection('refreshTokens').save({refreshToken: refreshTokenHash, clientId: client.clientId, userId: username}, function (err) {
                    if (err) return done(err)
                    done(null, token, refreshToken, {expires_in: expirationDate})
                })
            })
        })
    })
}))

//Refresh Token
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')

    db.collection('refreshTokens').findOne({refreshToken: refreshTokenHash}, function (err, token) {
        if (err) return done(err)
        if (!token) return done(null, false)
        if (client.clientId !== token.clientId) return done(null, false)
        
        var newAccessToken = utils.uid(256)
        var accessTokenHash = crypto.createHash('sha1').update(newAccessToken).digest('hex')
        
        var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
    
        db.collection('accessTokens').update({userId: token.userId}, {$set: {token: accessTokenHash, scope: scope, expirationDate: expirationDate}}, function (err) {
            if (err) return done(err)
            done(null, newAccessToken, refreshToken, {expires_in: expirationDate});
        })
    })
}))

// token endpoint
exports.token = [
    passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
    server.token(),
    server.errorHandler()
]

