import * as WebSocket from 'ws';
import * as http from 'http';


let ws = new WebSocket.Server({port: 8080});

ws.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {

    console.log("server get connection");
    socket.send("hello client I`m server");

    socket.on("message", (data: WebSocket.Data) => {

        console.log(data);
    });
});