"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = __importStar(require("ws"));
var ws = new WebSocket.Server({ port: 8080 });
ws.on('connection', function (socket, request) {
    console.log("server get connection");
    socket.send("hello client I`m server");
    socket.on("message", function (data) {
        console.log(data);
    });
});
