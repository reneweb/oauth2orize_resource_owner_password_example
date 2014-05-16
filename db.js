var mongojs = require('mongojs')

var db;

exports.db = function() {
    if (db === null) {
        db = mongojs(process.env.IP + '/oauth2orize_resource_owner_password_example')
    }
    
    return db
}
