var mongojs = require('mongojs')

var db = mongojs(process.env.IP + '/oauth2orize_resource_owner_password_example')

exports.db = function() {
    return db
}
