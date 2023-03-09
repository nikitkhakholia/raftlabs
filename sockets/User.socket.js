const WebSocket = require("ws");
const UserModel = require("../models/User.model");

exports.startUserSocket = (server) => {
    const wss = new WebSocket.Server({ server, path: "/users" });
    wss.on('connection', ws => {
        ws.on('message', message => {
            const { id } = JSON.parse(message)
            UserModel.findById(id).select("-encryPassword -salt").exec((err, data) => {
                if (err) ws.send({ status: "error", message: err.message })
                else {
                    ws.send(JSON.stringify({ status: "success", data }))
                }
            })

        })
    })
}