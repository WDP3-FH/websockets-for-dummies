import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
    console.log("Server: a user connected");

    ws.on("message", function message(data) {
        const client_message = JSON.parse(data);
        console.log("Client sent the server: %s", client_message);

        switch (client_message.type) {
            case "open":
                const response = {
                    type: "open",
                    userId: "SERVER",
                    msg: "Greetings, " + client_message.userId + "!",
                };
                ws.send(JSON.stringify(response));
                break;
            case "messageSent":
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

    ws.on("close", function close() {
        console.log("Server: a client disconnected");
    });
});

console.log("Running...");
