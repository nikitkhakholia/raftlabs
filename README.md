# raftlabs assignment
This is a basic node application with CRUD api's to Register, Login, Update, Get Logged In User, Get All Users(ADMIN), Delete User(ADMIN), Clear Cache. The api's are intreageted with Redis to decrease the coumputing costs and provide faster response. This application also contains a basic websocket to exchange the data.

# .env details
DATABASE=mongodb://username:password@endpoint.com:port/db-name

PORT=3000

REDIS=redis://username:password@endpoint.com:port

SECRET=password-or-secret-string-to encrypt user passwords and jwt tokens
