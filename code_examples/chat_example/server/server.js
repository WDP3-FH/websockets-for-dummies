import WebSocket, { WebSocketServer } from "ws";

// CREATE WEBSOCKET SERVER
const wss = new WebSocketServer({ port: 8080 });

// MESSAGE (open) FROM CLIENT
wss.on("connection", function connection(ws) {
    console.log("Server: a user connected");

    // MESSAGE (message) FROM CLIENT
    ws.on("message", function message(data) {
        const client_message = JSON.parse(data);
        console.log("Client sent the server: %s", client_message);

        // single message type is not enough => build custom "events" using switch and type field in client messages
        // Libraries (such as Socket.io) would add the capability of transmitting custom events
        switch (client_message.type) {
            case "open": // client sent first message (open)
                const response = {
                    type: "open",
                    userId: "SERVER",
                    msg: "Greetings, " + client_message.userId + "!",
                };
                ws.send(JSON.stringify(response));
                break;
            case "messageSent": // client sent chat message
                // distribute chat message to all active clients
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(client_message));
                    }
                });
                break;
            default:
                console.log(`Unknown type ${client_message.type} was sent.`);
        }
    });

    // MESSAGE (close) FROM CLIENT
    ws.on("close", function close() {
        console.log("Server: a client disconnected");
    });
});

console.log("Running...");
