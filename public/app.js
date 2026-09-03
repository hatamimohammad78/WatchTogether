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

    status.textContent =
        `فیلم "${file.name}" آماده پخش است 🎬`;
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
// دریافت فرمان از طرف مقابل
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

    // کمی زمان می‌دهیم تا eventهای ویدیو
    // دوباره فرمان را ارسال نکنند

    setTimeout(() => {

        isRemoteAction = false;

    }, 300);

});