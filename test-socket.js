

const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("--- Connected Socket:", socket.id);

    /** Send test msg server */
    socket.emit("sendMessage", { user: "USER", text: "Hello USER Test please socket" });

    /** join globales room */
    socket.emit("joinRoom", "global Room");

    /** send specific room msg */
    socket.emit("sendRoomMessage", { roomName: "Room-1", message: "Hello everyone!" });
});

/** listen DB for update notification when change status */
socket.on("userStatusUpdated", (data) => {
    console.log("--- User status changed:", data);
});

/** Listen  broadcast mgd */
socket.on("receiveMessage", (data) => {
    console.log("---  Congrats USER test broadcast:", data);
});

/**  room msg */
socket.on("message", (data) => {
    console.log("--- Room Message:", data);
});
