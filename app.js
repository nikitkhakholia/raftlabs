require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const { startUserSocket } = require("./sockets/User.socket");
const WebSocket = require("ws");

// Setting cache client
global.CacheClient = require("redis").createClient({ url: process.env.REDIS });
CacheClient.on("error", (e) => {
    console.error(e);
});

//DB Connection
mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        console.log("*** DB CONNECTION SUCCESSFULL ***");
        //Starting a server
        const app = express();
        app.use(bodyParser.json());
        app.use(require("./routes/User.route"))
        var server = require("http").createServer(app)
        startUserSocket(server)
        server.listen(process.env.PORT, async () => {
            console.log(`*** SERVER STARTED AT PORT ${process.env.PORT} ***`);
        });

    })
    .catch((e) => {
        console.error("Startup Exception: " + e);
    });