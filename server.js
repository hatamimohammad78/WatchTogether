const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
});

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================
// ابزارهای کمکی
// =====================================

function cleanText(value, maxLength = 100) {

    if (typeof value !== "string") {
        return "";
    }

    return value
        .trim()
        .slice(0, maxLength);

}


function isValidRoom(socket, roomId) {

    return (
        socket.data &&
        socket.data.roomId &&
        socket.data.roomId === roomId
    );

}


// =====================================
// محاسبه کاربران آنلاین اتاق
// =====================================

function getRoomUsers(roomId) {

    const room =
        io.sockets.adapter.rooms.get(roomId);

    if (!room) {

        return {
            count: 0,
            users: []
        };

    }

    const users =
        [...room].map((id) => {

            const memberSocket =
                io.sockets.sockets.get(id);

            const name =
                memberSocket?.data?.name ||
                "کاربر";

            return {
                id,
                name
            };

        });

    return {
        count: users.length,
        users
    };

}


// =====================================
// Connection
// =====================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "A user connected:",
            socket.id
        );


        // =====================================
        // ورود به اتاق
        // =====================================

        socket.on(
            "join-room",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                const name =
                    cleanText(data.name, 40);

                if (!roomId || !name) {
                    return;
                }


                // اگر قبلاً داخل اتاق دیگری است،
                // ابتدا از آن خارج شود

                if (socket.data.roomId) {

                    socket.leave(
                        socket.data.roomId
                    );

                }


                socket.data.roomId =
                    roomId;

                socket.data.name =
                    name;


                socket.join(
                    roomId
                );


                const roomInfo =
                    getRoomUsers(roomId);


                // لیست کاربران

                io.to(roomId).emit(
                    "room-users",
                    roomInfo
                );


                // پیام ورود

                io.to(roomId).emit(
                    "system-message",
                    {
                        text:
                            `${name} وارد اتاق شد`
                    }
                );


                console.log(
                    `${name} (${socket.id}) joined room ${roomId}`
                );


                // =====================================
                // پیدا کردن نفر قبلی
                // =====================================

                const room =
                    io.sockets.adapter.rooms.get(
                        roomId
                    );

                const otherIds =
                    room
                        ? [...room].filter(
                            (id) =>
                                id !== socket.id
                        )
                        : [];


                // فقط اولین نفر قبلی
                // برای WebRTC

                if (otherIds.length > 0) {

                    socket.emit(
                        "existing-peer",
                        {
                            peerId:
                                otherIds[0]
                        }
                    );

                }

            }
        );


        // =====================================
        // کنترل فیلم
        // =====================================

        socket.on(
            "video-action",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                if (
                    !roomId ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                const type =
                    data.type;

                if (
                    type !== "play" &&
                    type !== "pause" &&
                    type !== "seek"
                ) {
                    return;
                }


                const time =
                    Number(data.time);

                if (
                    !Number.isFinite(time) ||
                    time < 0
                ) {
                    return;
                }


                socket
                    .to(roomId)
                    .emit(
                        "video-action",
                        {
                            type,
                            time
                        }
                    );

            }
        );


        // =====================================
        // ری‌اکشن
        // =====================================

        socket.on(
            "video-reaction",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                const emoji =
                    cleanText(data.emoji, 10);

                if (
                    !roomId ||
                    !emoji ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                socket
                    .to(roomId)
                    .emit(
                        "video-reaction",
                        {
                            emoji
                        }
                    );

            }
        );


        // =====================================
        // وضعیت ویس
        // =====================================

        socket.on(
            "voice-status",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                if (
                    !roomId ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                socket
                    .to(roomId)
                    .emit(
                        "voice-status",
                        {
                            name:
                                socket.data.name ||
                                "پارتنر",

                            speaking:
                                Boolean(
                                    data.speaking
                                )
                        }
                    );

            }
        );


        // =====================================
        // درخواست Sync
        // =====================================

        socket.on(
            "request-sync",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                if (
                    !roomId ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                socket
                    .to(roomId)
                    .emit(
                        "sync-request"
                    );

            }
        );


        // =====================================
        // پاسخ Sync
        // =====================================

        socket.on(
            "sync-response",
            (data) => {

                if (!data) {
                    return;
                }

                const roomId =
                    cleanText(data.roomId, 50);

                if (
                    !roomId ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                const time =
                    Number(data.time);

                if (
                    !Number.isFinite(time) ||
                    time < 0
                ) {
                    return;
                }


                socket
                    .to(roomId)
                    .emit(
                        "sync-response",
                        {
                            time,
                            playing:
                                Boolean(
                                    data.playing
                                )
                        }
                    );

            }
        );


        // =====================================
        // Chat
        // =====================================

        socket.on(
            "chat-message",
            (data) => {

                if (!data) {
                    return;
                }


                const roomId =
                    cleanText(data.roomId, 50);

                const message =
                    cleanText(data.message, 1000);


                if (
                    !roomId ||
                    !message ||
                    !isValidRoom(socket, roomId)
                ) {
                    return;
                }


                const senderName =
                    socket.data.name ||
                    "مهمان";


                socket
                    .to(roomId)
                    .emit(
                        "chat-message",
                        {
                            name:
                                senderName,

                            message,

                            time:
                                data.time || ""
                        }
                    );

            }
        );


        // =====================================
        // WebRTC Offer
        // =====================================

        socket.on(
            "webrtc-offer",
            (data) => {

                if (
                    !data ||
                    !data.to ||
                    !data.offer
                ) {
                    return;
                }


                const targetSocket =
                    io.sockets.sockets.get(
                        data.to
                    );


                if (!targetSocket) {
                    return;
                }


                // فقط اگر هر دو نفر
                // در یک اتاق باشند

                if (
                    !socket.data.roomId ||
                    targetSocket.data.roomId !==
                        socket.data.roomId
                ) {
                    return;
                }


                io.to(data.to).emit(
                    "webrtc-offer",
                    {
                        from:
                            socket.id,

                        offer:
                            data.offer
                    }
                );

            }
        );


        // =====================================
        // WebRTC Answer
        // =====================================

        socket.on(
            "webrtc-answer",
            (data) => {

                if (
                    !data ||
                    !data.to ||
                    !data.answer
                ) {
                    return;
                }


                const targetSocket =
                    io.sockets.sockets.get(
                        data.to
                    );


                if (!targetSocket) {
                    return;
                }


                if (
                    !socket.data.roomId ||
                    targetSocket.data.roomId !==
                        socket.data.roomId
                ) {
                    return;
                }


                io.to(data.to).emit(
                    "webrtc-answer",
                    {
                        from:
                            socket.id,

                        answer:
                            data.answer
                    }
                );

            }
        );


        // =====================================
        // WebRTC ICE Candidate
        // =====================================

        socket.on(
            "webrtc-ice-candidate",
            (data) => {

                if (
                    !data ||
                    !data.to ||
                    !data.candidate
                ) {
                    return;
                }


                const targetSocket =
                    io.sockets.sockets.get(
                        data.to
                    );


                if (!targetSocket) {
                    return;
                }


                if (
                    !socket.data.roomId ||
                    targetSocket.data.roomId !==
                        socket.data.roomId
                ) {
                    return;
                }


                io.to(data.to).emit(
                    "webrtc-ice-candidate",
                    {
                        from:
                            socket.id,

                        candidate:
                            data.candidate
                    }
                );

            }
        );


        // =====================================
        // قطع اتصال
        // =====================================

        socket.on(
            "disconnect",
            () => {

                const roomId =
                    socket.data.roomId;

                const name =
                    socket.data.name;


                console.log(
                    "User disconnected:",
                    socket.id
                );


                if (!roomId) {
                    return;
                }


                // بعد از disconnect،
                // Socket.IO دیگر این socket
                // را داخل room نمی‌داند

                const roomInfo =
                    getRoomUsers(roomId);


                io.to(roomId).emit(
                    "room-users",
                    roomInfo
                );


                if (name) {

                    io.to(roomId).emit(
                        "system-message",
                        {
                            text:
                                `${name} از اتاق خارج شد`
                        }
                    );

                }

            }
        );

    }
);


// =====================================
// Server
// =====================================

const PORT =
    process.env.PORT || 3000;


server.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);