const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { WebSocketServer } = require("ws");

const app = express();
const portNumber = 3000;

const port = new SerialPort({
    path: "COM14",
    baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const wss = new WebSocketServer({ noServer: true });
parser.on("data", (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            // 1 means the connection is open
            client.send(data);
        }
    });
});

app.get("/", (req, res) => {
    res.send(
        "WebSocket server running. Connect to the WebSocket for real-time data."
    );
});

const server = app.listen(portNumber, () => {
    console.log(`Server running at http://localhost:${portNumber}`);
});

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});
