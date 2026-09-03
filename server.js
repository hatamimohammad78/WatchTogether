const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");


const app = express();

const server =
    http.createServer(app);

const io =
    new Server(server);


app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


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

                if (
                    !data ||
                    !data.roomId ||
                    !data.name
                ) {

                    return;

                }


                const roomId =
                    data.roomId;


                const name =
                    data.name;


                // ذخیره اطلاعات کاربر

                socket.data.roomId =
                    roomId;


                socket.data.name =
                    name;


                // ورود به اتاق

                socket.join(
                    roomId
                );


                const room =
                    io.sockets.adapter.rooms.get(
                        roomId
                    );


                const users =
                    room
                        ? room.size
                        : 0;


                // ارسال تعداد کاربران

                io.to(roomId).emit(
                    "users-count",
                    users
                );


                console.log(
                    `${name} (${socket.id}) joined room ${roomId}`
                );

            }
        );


        // =====================================
        // کنترل فیلم
        // =====================================

        socket.on(
            "video-action",
            (data) => {

                if (
                    !data ||
                    !data.roomId
                ) {

                    return;

                }


                socket
                    .to(data.roomId)
                    .emit(
                        "video-action",
                        data
                    );

            }
        );


        // =====================================
        // درخواست Sync
        // =====================================

        socket.on(
            "request-sync",
            (data) => {

                if (
                    !data ||
                    !data.roomId
                ) {

                    return;

                }


                socket
                    .to(data.roomId)
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

                if (
                    !data ||
                    !data.roomId
                ) {

                    return;

                }


                socket
                    .to(data.roomId)
                    .emit(
                        "sync-response",
                        {

                            time:
                                data.time,

                            playing:
                                data.playing

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

                if (
                    !data ||
                    !data.roomId ||
                    !data.message
                ) {

                    return;

                }


                const senderName =
                    socket.data.name ||
                    data.name ||
                    "مهمان";


                socket
                    .to(data.roomId)
                    .emit(
                        "chat-message",
                        {

                            name:
                                senderName,

                            message:
                                data.message,

                            time:
                                data.time

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


                console.log(
                    "User disconnected:",
                    socket.id
                );


                if (roomId) {

                    const room =
                        io.sockets.adapter.rooms.get(
                            roomId
                        );


                    const users =
                        room
                            ? room.size
                            : 0;


                    io.to(roomId).emit(
                        "users-count",
                        users
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