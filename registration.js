var db = require('./db').db()
    , passport = require('passport')
    , bcrypt = require('bcrypt')

exports.registerUser = function(req, res) {
    req.checkBody('username', 'No valid username is given').notEmpty().len(3, 40)
    req.checkBody('password', 'No valid password is given').notEmpty().len(6, 50)

    res.setHeader('Content-Type', 'application/json')

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors, 400)
    } else {
        var username = req.body['username']
        var password = req.body['password']

        db.collection('users').findOne({username: username}, function (err, user) {
            if(user) {
                res.send("Username is already taken", 422)
            } else {
                bcrypt.hash(password, 11, function (err, hash) {
                    db.collection('users').save({username: username, password: hash}, function (err) {
                        res.send({username: username}, 201)
                    })
                })
            }
        })
    }
}