
import WebSocket=require('ws');
import http=require ('http');
import Client from "./src/Client";
import GameManager from "./src/GameManager";




let ws = new WebSocket.Server({port: 8080});

ws.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {

    console.log("Server get connection");
    //这里连接到服务器，创建客户端
    let client = new Client(socket);
    GameManager.getInstance(GameManager).addClient(client);
});


console.log(`Serverstart ${new Date().getTime()}`);