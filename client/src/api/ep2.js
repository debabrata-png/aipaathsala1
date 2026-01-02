import { io } from "socket.io-client";
import global1 from "../pages/global1";

// Centralized socket connection
// const socket = io("http://localhost:8000", {
const socket = io("https://ctchat1.azurewebsites.net", {
    transports: ["websocket"],
    reconnection: true,
    query: {
        userId: global1.userEmail,
        userName: global1.userName,
        colid: global1.colid,
    },
});

export default socket;
