const socket = io();

const video = document.getElementById("video");
const fileInput = document.getElementById("fileInput");

const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const status = document.getElementById("status");
const meStatus = document.getElementById("meStatus");
const partnerStatus = document.getElementById("partnerStatus");

let videoUrl = null;
let roomId = null;

// جلوگیری از ارسال دوباره فرمانی که از طرف مقابل دریافت شده
let isRemoteAction = false;

// زمان آخرین همگام‌سازی
let lastSyncTime = 0;

// فاصله زمانی مجاز بین دو فیلم
const SYNC_THRESHOLD = 0.25;

// هر چند میلی‌ثانیه یک بار Sync بررسی شود
const SYNC_INTERVAL = 3000;


// =====================================
// انتخاب فیلم
// =====================================

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
    }

    videoUrl = URL.createObjectURL(file);

    video.src = videoUrl;

    video.load();

    status.textContent = `فیلم "${file.name}" آماده پخش است 🎬`;
});


// =====================================
// ورود به اتاق
// =====================================

joinBtn.addEventListener("click", () => {

    const room = roomInput.value.trim();

    if (!room) {
        alert("لطفاً کد اتاق را وارد کنید.");
        return;
    }

    roomId = room;

    socket.emit("join-room", roomId);

    status.textContent =
        `شما وارد اتاق ${roomId} شدید ❤️`;

    meStatus.textContent = "🟢";

    roomInput.disabled = true;
    joinBtn.disabled = true;
});


// =====================================
// تعداد کاربران
// =====================================

socket.on("users-count", (count) => {

    if (count >= 2) {

        partnerStatus.textContent = "🟢";

        status.textContent =
            "هر دو نفر داخل اتاق هستند ❤️";

    } else {

        partnerStatus.textContent = "⚪";

        status.textContent =
            "منتظر ورود پارتنر...";

    }
});


// =====================================
// PLAY
// =====================================

video.addEventListener("play", () => {

    if (isRemoteAction || !roomId) return;

    socket.emit("video-action", {

        roomId: roomId,

        type: "play",

        time: video.currentTime

    });
});


// =====================================
// PAUSE
// =====================================

video.addEventListener("pause", () => {

    if (isRemoteAction || !roomId) return;

    socket.emit("video-action", {

        roomId: roomId,

        type: "pause",

        time: video.currentTime

    });
});


// =====================================
// SEEK
// =====================================

video.addEventListener("seeked", () => {

    if (isRemoteAction || !roomId) return;

    socket.emit("video-action", {

        roomId: roomId,

        type: "seek",

        time: video.currentTime

    });
});


// =====================================
// دریافت فرمان از نفر دوم
// =====================================

socket.on("video-action", async (data) => {

    if (!video.src) return;

    isRemoteAction = true;

    try {

        if (data.type === "seek") {

            video.currentTime = data.time;
        }

        if (data.type === "play") {

            video.currentTime = data.time;

            await video.play();
        }

        if (data.type === "pause") {

            video.currentTime = data.time;

            video.pause();
        }

    } catch (error) {

        console.log("Video action error:", error);

    }

    setTimeout(() => {

        isRemoteAction = false;

    }, 100);
});


// =====================================
// درخواست Sync از نفر دیگر
// =====================================

socket.on("sync-request", () => {

    if (!video.src || !roomId) return;

    socket.emit("sync-response", {

        roomId: roomId,

        time: video.currentTime,

        playing: !video.paused

    });
});


// =====================================
// دریافت اطلاعات Sync
// =====================================

socket.on("sync-response", async (data) => {

    if (!video.src) return;

    const now = Date.now();

    // جلوگیری از Sync بیش از حد
    if (now - lastSyncTime < 1000) {
        return;
    }

    lastSyncTime = now;

    const difference =
        Math.abs(video.currentTime - data.time);

    // اگر اختلاف کمتر از حد مجاز است
    // کاری انجام نمی‌دهیم
    if (difference < SYNC_THRESHOLD) {

        return;
    }

    isRemoteAction = true;

    try {

        // اصلاح زمان
        video.currentTime = data.time;

        // اصلاح وضعیت Play / Pause
        if (data.playing && video.paused) {

            await video.play();

        } else if (!data.playing && !video.paused) {

            video.pause();

        }

    } catch (error) {

        console.log("Sync error:", error);

    }

    setTimeout(() => {

        isRemoteAction = false;

    }, 100);

});


// =====================================
// هر چند ثانیه Sync را بررسی کن
// =====================================

setInterval(() => {

    if (!roomId || !video.src) {
        return;
    }

    socket.emit("request-sync", {

        roomId: roomId

    });

}, SYNC_INTERVAL);