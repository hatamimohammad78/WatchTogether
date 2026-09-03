const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// =====================================
// نمایش فایل‌های داخل پوشه public
// =====================================

app.use(express.static(path.join(__dirname, "public")));

// =====================================
// اتصال کاربران
// =====================================

io.on("connection", (socket) => {

    console.log("A user connected:", socket.id);

    // =================================
    // ورود به اتاق
    // =================================

    socket.on("join-room", (roomId) => {

        socket.join(roomId);

        const room = io.sockets.adapter.rooms.get(roomId);

        const users = room ? room.size : 0;

        io.to(roomId).emit("users-count", users);

        console.log(
            `${socket.id} joined room ${roomId}`
        );

    });


    // =================================
    // ارسال Play / Pause / Seek
    // =================================

    socket.on("video-action", (data) => {

        socket
            .to(data.roomId)
            .emit("video-action", data);

    });


    // =================================
    // درخواست همگام‌سازی
    // =================================

    socket.on("request-sync", (data) => {

        socket
            .to(data.roomId)
            .emit("sync-request");

    });


    // =================================
    // پاسخ به درخواست Sync
    // =================================

    socket.on("sync-response", (data) => {

        socket
            .to(data.roomId)
            .emit("sync-response", {

                time: data.time,

                playing: data.playing

            });

    });


    // =================================
    // قطع اتصال کاربر
    // =================================

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


// =====================================
// اجرای سرور
// =====================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});