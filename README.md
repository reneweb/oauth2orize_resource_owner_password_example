oauth2orize_resource_owner_password_example
===========================================

This is an example of oAuth's resource owner password flow using oauth2orize, express 4 and mongoDB.

##### Installation

```
git clone https://github.com/reneweb/oauth2orize_resource_owner_password_example.git
npm install
node app.js
```
Note: You may need to change the database configuration in the db.js file, if mongoDB doesn't run using the default port or is not running on localhost.

##### Usage (with cURL)

###### 0 - Create a client

First of all you need to create a client in the clients collection, for example, with the mongo shell. The client should have a clientId, a clientSecret and it should be a trustedClient.
For example:
{"clientId" : "test", "clientSecret" : "secret", "trustedClient" : true}

###### 1 - Register a user

```
curl -v -H "Content-Type: application/json" -X POST <IP>:<PORT>/users -d '{"username": "<username>", "password": "<password>"}'
```

###### 2 - Get an access token

```
curl -v -H "Content-Type: application/json" -X POST <IP>:<PORT>/oauth/token -u <clientId>:<clientSecret> -d '{"username": "<username>", "password": "<password>", "grant_type": "password"}'
```

###### 3 - Access a restricted resource using the access token

```
curl -X GET <IP>:<PORT>/restricted -v -H "Authorization: Bearer <accessToken>"
```

###### 4 - Get a new access token using the refresh token

```
curl -X POST <IP>:<PORT>/oauth/token -u <clientId>:<clientSecret> -v -H "Content-Type: application/json" -d '{"grant_type": "refresh_token", "refresh_token": "<refreshToken>"}'
```

