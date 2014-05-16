//Module dependencies
var express = require('express')
    , http = require('http')
    , passport = require('passport')
    , util = require('util')
    , bodyParser = require('body-parser')
    , expressValidator = require('express-validator')
    , auth = require("./auth")
    , oauth = require("./oauth")
    , registration = require("./registration")

// Express configuration
var app = express()
app.use(bodyParser())
app.use(expressValidator())

app.use(passport.initialize())

app.post('/users', registration.registerUser)
app.post('/oauth/token', oauth.token)
app.get('/restricted', passport.authenticate('accessToken', { session: false }), function (req, res) {
    res.send("Yay, you successfully accessed the resitricted resource!")
})

//Start
http.createServer(app).listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0")