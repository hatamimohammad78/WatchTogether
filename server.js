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
    transports: ["websocket", "polling"],

    // تشخیص سریع‌تر قطع شدن اینترنت (حدود ۲۰ ثانیه)
    pingInterval: 10000,
    pingTimeout: 10000
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
// کاربران اتاق (با مهلت بازگشت بعد از قطع اینترنت)
// =====================================

// وقتی اینترنت کاربر قطع می‌شود، فوراً از اتاق حذف نمی‌شود.
// تا این مدت منتظر می‌مانیم که دوباره وصل شود.
// (با متغیر محیطی RECONNECT_GRACE_MS هم قابل تغییر است)
const RECONNECT_GRACE_MS =
    Number(process.env.RECONNECT_GRACE_MS) ||
    2 * 60 * 1000;


// =====================================
// جلوگیری از پیام‌های پشت‌سرهم «قطع شد / وصل شد»
// وقتی نت ضعیف است و مدام قطع و وصل می‌شود
// =====================================

// قطعی باید حداقل این‌قدر طول بکشد تا برای پارتنر «قطع شد» نمایش داده شود.
// قطعی‌های کوتاه‌تر اصلاً نمایش داده نمی‌شوند.
// (با متغیر محیطی OFFLINE_NOTICE_DELAY_MS قابل تغییر است)
const OFFLINE_NOTICE_DELAY_MS =
    Number(process.env.OFFLINE_NOTICE_DELAY_MS) ||
    5000;

// بعد از «قطع شد»، اتصال باید این‌قدر بدون قطعی بماند
// تا «دوباره وصل شد» نمایش داده شود.
// (با متغیر محیطی ONLINE_STABLE_MS قابل تغییر است)
const ONLINE_STABLE_MS =
    Number(process.env.ONLINE_STABLE_MS) ||
    8000;


// roomId -> Map( clientId -> { name, socketId, online, timer } )
//
// clientId شناسه ثابت مرورگر است.
// بعد از قطع و وصل شدن اینترنت، socket.id عوض می‌شود
// ولی clientId همان می‌ماند، پس می‌دانیم همان کاربر برگشته است.
const roomParticipants = new Map();


function getRoomUsers(roomId) {

    const participants =
        roomParticipants.get(roomId);

    if (!participants) {

        return {
            count: 0,
            onlineCount: 0,
            users: []
        };

    }

    const users =
        [...participants.values()].map((participant) => {

            return {

                id:
                    participant.socketId,

                name:
                    participant.name ||
                    "کاربر",

                online:
                    participant.online &&
                    !participant.warned

            };

        });

    return {

        count:
            users.length,

        onlineCount:
            users.filter(
                (user) => user.online
            ).length,

        users

    };

}


// حذف کامل کاربر از اتاق
// (بعد از پایان مهلت بازگشت، یا وقتی عمداً اتاق را عوض می‌کند)

function removeParticipant(roomId, clientId) {

    const participants =
        roomParticipants.get(roomId);

    if (!participants) {
        return;
    }

    const participant =
        participants.get(clientId);

    if (!participant) {
        return;
    }

    clearTimeout(participant.timer);
    clearTimeout(participant.noticeTimer);
    clearTimeout(participant.stableTimer);

    participants.delete(
        clientId
    );

    if (participants.size === 0) {

        roomParticipants.delete(
            roomId
        );

    }

    io.to(roomId).emit(
        "room-users",
        getRoomUsers(roomId)
    );

    io.to(roomId).emit(
        "system-message",
        {
            text:
                `${participant.name} از اتاق خارج شد`
        }
    );

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

                // شناسه ثابت مرورگر.
                // بعد از قطع و وصل شدن اینترنت، socket.id عوض می‌شود
                // ولی clientId همان می‌ماند.
                const clientId =
                    cleanText(data.clientId, 64);

                if (
                    !roomId ||
                    !name ||
                    !clientId
                ) {
                    return;
                }


                // اگر قبلاً داخل اتاق دیگری بوده،
                // ابتدا از آن اتاق خارج شود

                if (
                    socket.data.roomId &&
                    socket.data.roomId !== roomId
                ) {

                    const previousRoomId =
                        socket.data.roomId;

                    const previousClientId =
                        socket.data.clientId;

                    socket.leave(
                        previousRoomId
                    );

                    removeParticipant(
                        previousRoomId,
                        previousClientId
                    );

                }


                // =====================================
                // ثبت کاربر در اتاق
                // =====================================

                let participants =
                    roomParticipants.get(roomId);

                if (!participants) {

                    participants =
                        new Map();

                    roomParticipants.set(
                        roomId,
                        participants
                    );

                }

                const existingParticipant =
                    participants.get(clientId);

                // اگر این کاربر قبلاً در همین اتاق بوده،
                // یعنی بعد از قطع شدن اینترنت برگشته است
                const isReconnect =
                    Boolean(existingParticipant);

                if (existingParticipant) {

                    clearTimeout(
                        existingParticipant.timer
                    );

                    existingParticipant.timer =
                        null;

                    // اگر هنوز «قطع شد» اعلام نشده بود، لغو می‌شود
                    // (قطعی کوتاه بوده و نباید چیزی نمایش داده شود)
                    clearTimeout(
                        existingParticipant.noticeTimer
                    );

                    existingParticipant.noticeTimer =
                        null;

                    clearTimeout(
                        existingParticipant.stableTimer
                    );

                    existingParticipant.stableTimer =
                        null;

                    existingParticipant.name =
                        name;

                    existingParticipant.socketId =
                        socket.id;

                    existingParticipant.online =
                        true;

                    // اگر قبلاً «قطع شد» اعلام شده، «دوباره وصل شد» فقط وقتی
                    // اعلام می‌شود که اتصال مدتی بدون قطعی پایدار مانده باشد.
                    if (existingParticipant.warned) {

                        const stableParticipant =
                            existingParticipant;

                        stableParticipant.stableTimer =
                            setTimeout(
                                () => {

                                    stableParticipant.stableTimer =
                                        null;

                                    if (
                                        !stableParticipant.online ||
                                        !stableParticipant.warned
                                    ) {
                                        return;
                                    }

                                    stableParticipant.warned =
                                        false;

                                    io.to(roomId).emit(
                                        "room-users",
                                        getRoomUsers(roomId)
                                    );

                                    io.to(roomId)
                                        .except(stableParticipant.socketId)
                                        .emit(
                                            "system-message",
                                            {
                                                type: "success",
                                                text:
                                                    `✅ اینترنت ${stableParticipant.name} دوباره وصل شد`
                                            }
                                        );

                                },
                                ONLINE_STABLE_MS
                            );

                    }

                }
                else {

                    participants.set(
                        clientId,
                        {
                            name,
                            socketId: socket.id,
                            online: true,
                            timer: null,
                            noticeTimer: null,
                            stableTimer: null,
                            warned: false
                        }
                    );

                }


                socket.data.roomId =
                    roomId;

                socket.data.name =
                    name;

                socket.data.clientId =
                    clientId;


                socket.join(
                    roomId
                );


                // لیست کاربران

                io.to(roomId).emit(
                    "room-users",
                    getRoomUsers(roomId)
                );


                // پیام ورود (فقط برای ورود واقعی)
                // پیام برگشت بعد از قطعی، جداگانه و بعد از پایدار شدن اتصال می‌آید.

                if (!isReconnect) {

                    io.to(roomId).emit(
                        "system-message",
                        {
                            text:
                                `${name} وارد اتاق شد`
                        }
                    );

                }


                console.log(
                    `${name} (${socket.id}) ${isReconnect ? "rejoined" : "joined"} room ${roomId}`
                );


                // =====================================
                // پیدا کردن نفر قبلی (فقط کسی که آنلاین است)
                // =====================================

                let otherPeerId = null;

                for (
                    const [otherClientId, other]
                    of participants
                ) {

                    if (
                        otherClientId !== clientId &&
                        other.online &&
                        other.socketId
                    ) {

                        otherPeerId =
                            other.socketId;

                        break;

                    }

                }


                // فقط اولین نفر قبلی
                // برای WebRTC

                if (otherPeerId) {

                    socket.emit(
                        "existing-peer",
                        {
                            peerId:
                                otherPeerId
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
            (reason) => {

                const roomId =
                    socket.data.roomId;

                const clientId =
                    socket.data.clientId;

                const name =
                    socket.data.name;


                console.log(
                    "User disconnected:",
                    socket.id,
                    reason
                );


                if (
                    !roomId ||
                    !clientId
                ) {
                    return;
                }


                const participants =
                    roomParticipants.get(roomId);

                const participant =
                    participants
                        ? participants.get(clientId)
                        : null;


                // اگر کاربر قبلاً با Socket جدید برگشته،
                // این disconnect مربوط به Socket قدیمی است
                // و نباید کاربر را آفلاین کند.

                if (
                    !participant ||
                    participant.socketId !== socket.id
                ) {
                    return;
                }


                // کاربر از اتاق حذف نمی‌شود؛
                // فقط آفلاین می‌شود و تا پایان مهلت منتظر برگشتنش می‌مانیم.

                participant.online =
                    false;

                clearTimeout(
                    participant.timer
                );

                participant.timer =
                    setTimeout(
                        () => {

                            const current =
                                roomParticipants
                                    .get(roomId)
                                    ?.get(clientId);

                            // اگر در این فاصله برگشته باشد، حذف نمی‌شود
                            if (
                                current &&
                                !current.online
                            ) {

                                removeParticipant(
                                    roomId,
                                    clientId
                                );

                            }

                        },
                        RECONNECT_GRACE_MS
                    );


                // «قطع شد» فوراً اعلام نمی‌شود.
                // اگر قطعی کوتاه باشد و کاربر زود برگردد، هیچ پیامی نمایش داده نمی‌شود.
                // اگر قطعی طول بکشد، فقط یک‌بار اعلام می‌شود
                // (حتی اگر بعدش مدام قطع و وصل شود).

                clearTimeout(
                    participant.stableTimer
                );

                participant.stableTimer =
                    null;

                if (
                    !participant.warned &&
                    !participant.noticeTimer
                ) {

                    participant.noticeTimer =
                        setTimeout(
                            () => {

                                participant.noticeTimer =
                                    null;

                                // اگر در این فاصله برگشته باشد، چیزی اعلام نمی‌شود
                                if (participant.online) {
                                    return;
                                }

                                participant.warned =
                                    true;

                                io.to(roomId).emit(
                                    "room-users",
                                    getRoomUsers(roomId)
                                );

                                io.to(roomId).emit(
                                    "system-message",
                                    {
                                        type: "warning",
                                        text:
                                            `⚠️ اینترنت ${participant.name} قطع شد`
                                    }
                                );

                            },
                            OFFLINE_NOTICE_DELAY_MS
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