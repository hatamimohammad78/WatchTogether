const socket = io();


// =====================================
// عناصر صفحه
// =====================================

const video =
    document.getElementById("video");

const fileInput =
    document.getElementById("fileInput");

const roomInput =
    document.getElementById("roomInput");

const joinBtn =
    document.getElementById("joinBtn");

const status =
    document.getElementById("status");

const meStatus =
    document.getElementById("meStatus");

const partnerStatus =
    document.getElementById("partnerStatus");


// =====================================
// Chat
// =====================================

const chatMessages =
    document.getElementById("chatMessages");

const chatEmpty =
    document.getElementById("chatEmpty");

const chatInput =
    document.getElementById("chatInput");

const sendChatBtn =
    document.getElementById("sendChatBtn");

const chatNotifications =
    document.getElementById(
        "chatNotifications"
    );

const chatIdentity =
    document.getElementById(
        "chatIdentity"
    );


// =====================================
// Identity
// =====================================

const identityModal =
    document.getElementById(
        "identityModal"
    );

const mohammadBtn =
    document.getElementById(
        "mohammadBtn"
    );

const hastiBtn =
    document.getElementById(
        "hastiBtn"
    );

const changeIdentityBtn =
    document.getElementById(
        "changeIdentityBtn"
    );


// =====================================
// Emoji Picker (چت)
// =====================================

const emojiBtn =
    document.getElementById("emojiBtn");

const emojiPanel =
    document.getElementById("emojiPanel");


// =====================================
// Subtitle Picker
// =====================================

const subtitleInput =
    document.getElementById("subtitleInput");

let subtitleUrl = null;

let subtitleTrackElement = null;


// =====================================
// Player اختصاصی
// =====================================

const playerWrapper =
    document.getElementById("playerWrapper");

const centerPlayBtn =
    document.getElementById("centerPlayBtn");

const playPauseBtn =
    document.getElementById("playPauseBtn");

const playPauseIconPlay =
    playPauseBtn.querySelector(".icon-play");

const playPauseIconPause =
    playPauseBtn.querySelector(".icon-pause");

const progressBarWrap =
    document.getElementById("progressBarWrap");

const progressBarBuffered =
    document.getElementById("progressBarBuffered");

const progressBarFilled =
    document.getElementById("progressBarFilled");

const progressBarHandle =
    document.getElementById("progressBarHandle");

const timeDisplay =
    document.getElementById("timeDisplay");

const muteBtn =
    document.getElementById("muteBtn");

const volIconOn =
    muteBtn.querySelector(".icon-vol-on");

const volIconOff =
    muteBtn.querySelector(".icon-vol-off");

const volumeSlider =
    document.getElementById("volumeSlider");

const fullscreenBtn =
    document.getElementById("fullscreenBtn");

const expandIcon =
    fullscreenBtn.querySelector(".icon-expand");

const compressIcon =
    fullscreenBtn.querySelector(".icon-compress");

const playerControls =
    document.getElementById("playerControls");


// =====================================
// Speed Control (سرعت پخش)
// =====================================

const speedBtn =
    document.getElementById("speedBtn");

const speedMenu =
    document.getElementById("speedMenu");

const speedOptions = [
    0.25, 0.5, 0.75,
    1, 1.25, 1.5, 1.75, 2
];

let currentSpeed = 1;


speedOptions.forEach((speed) => {

    const item =
        document.createElement("button");

    item.type =
        "button";

    item.textContent =
        `${speed}×`;

    item.dataset.speed =
        speed;

    if (speed === 1) {

        item.classList.add(
            "active"
        );

    }


    item.addEventListener(
        "click",
        () => {

            setPlaybackRate(speed);

            speedMenu.classList.add(
                "hidden"
            );

        }
    );


    speedMenu.appendChild(
        item
    );

});


function setPlaybackRate(speed) {

    currentSpeed =
        speed;


    video.playbackRate =
        speed;


    speedBtn.textContent =
        `${speed}×`;


    speedMenu
        .querySelectorAll("button")
        .forEach((btn) => {

            btn.classList.toggle(
                "active",
                Number(btn.dataset.speed) === speed
            );

        });

}


speedBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        speedMenu.classList.toggle(
            "hidden"
        );


        reactionPicker.classList.add(
            "hidden"
        );

    }
);


document.addEventListener(
    "click",
    (event) => {

        if (
            !speedMenu.contains(event.target) &&
            event.target !== speedBtn
        ) {

            speedMenu.classList.add(
                "hidden"
            );

        }

    }
);


// =====================================
// Reactions (ری‌اکشن روی پلیر)
// =====================================

const reactionBtn =
    document.getElementById("reactionBtn");

const reactionPicker =
    document.getElementById("reactionPicker");

const reactionsLayer =
    document.getElementById("reactionsLayer");

const reactionEmojiList = [
    "❤️", "😂", "😮", "👏",
    "🔥", "😢", "🎉", "😱"
];


// =====================================
// Variables
// =====================================

let videoUrl = null;

let roomId = null;

let myName = null;


// جلوگیری از ارسال دوباره
// فرمانی که از طرف مقابل آمده

let isRemoteAction = false;


// جلوگیری از seek ناخواسته
// هنگام کشیدن نوار پیشرفت

let isDraggingProgress = false;


// =====================================
// انتخاب هویت
// =====================================

function selectIdentity(name) {

    myName = name;

    // ذخیره هویت در مرورگر
    localStorage.setItem(
        "watchTogetherName",
        name
    );

    chatIdentity.textContent =
        `شما: ${name}`;

    identityModal.classList.add(
        "hidden"
    );

    status.textContent =
        `سلام ${name} ❤️ حالا وارد اتاق شو`;

}


// =====================================
// دکمه محمد
// =====================================

mohammadBtn.addEventListener(
    "click",
    () => {

        selectIdentity("محمد");

    }
);


// =====================================
// دکمه هستی
// =====================================

hastiBtn.addEventListener(
    "click",
    () => {

        selectIdentity("هستی");

    }
);


// =====================================
// بازیابی هویت قبلی
// =====================================

const savedName =
    localStorage.getItem(
        "watchTogetherName"
    );

if (
    savedName === "محمد" ||
    savedName === "هستی"
) {

    myName = savedName;

    chatIdentity.textContent =
        `شما: ${myName}`;

    identityModal.classList.add(
        "hidden"
    );

    status.textContent =
        `سلام ${myName} ❤️ حالا وارد اتاق شو`;

}


// =====================================
// تغییر هویت
// =====================================

changeIdentityBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "watchTogetherName"
        );

        myName = null;

        chatIdentity.textContent =
            "—";

        identityModal.classList.remove(
            "hidden"
        );

        status.textContent =
            "لطفاً هویت خود را انتخاب کنید";

    }
);


// =====================================
// انتخاب فیلم
// =====================================

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0];

        if (!file) return;


        if (videoUrl) {

            URL.revokeObjectURL(
                videoUrl
            );

        }


        videoUrl =
            URL.createObjectURL(file);


        video.src =
            videoUrl;


        video.load();


        setPlaybackRate(1);


        status.textContent =
            `فیلم "${file.name}" آماده پخش است 🎬`;

    }
);


// =====================================
// تبدیل فرمت SRT به VTT
// (چون تگ <track> فقط VTT را می‌فهمد)
// =====================================

function convertSrtToVtt(srtText) {

    let vttText =
        "WEBVTT\n\n" +
        srtText
            .replace(/\r+/g, "")
            .replace(
                /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
                "$1.$2"
            );

    return vttText;

}


// =====================================
// انتخاب زیرنویس
// =====================================

subtitleInput.addEventListener(
    "change",
    async () => {

        const file =
            subtitleInput.files[0];

        if (!file) return;


        const rawText =
            await file.text();


        const isSrt =
            file.name
                .toLowerCase()
                .endsWith(".srt");


        const vttText =
            isSrt
                ? convertSrtToVtt(rawText)
                : rawText;


        // پاک کردن زیرنویس قبلی

        if (subtitleUrl) {

            URL.revokeObjectURL(
                subtitleUrl
            );

        }


        if (subtitleTrackElement) {

            subtitleTrackElement.remove();

        }


        // ساخت فایل VTT موقت در حافظه

        const blob =
            new Blob(
                [vttText],
                { type: "text/vtt" }
            );


        subtitleUrl =
            URL.createObjectURL(blob);


        // ساخت تگ track و افزودن به ویدیو

        subtitleTrackElement =
            document.createElement(
                "track"
            );


        subtitleTrackElement.kind =
            "subtitles";


        subtitleTrackElement.label =
            "فارسی";


        subtitleTrackElement.srclang =
            "fa";


        subtitleTrackElement.src =
            subtitleUrl;


        subtitleTrackElement.default =
            true;


        video.appendChild(
            subtitleTrackElement
        );


        // فعال کردن نمایش زیرنویس

        setTimeout(
            () => {

                if (video.textTracks[0]) {

                    video.textTracks[0].mode =
                        "showing";

                }

            },
            100
        );


        status.textContent =
            `زیرنویس "${file.name}" فعال شد ✅`;

    }
);


// =====================================
// ورود به اتاق
// =====================================

joinBtn.addEventListener(
    "click",
    () => {

        if (!myName) {

            identityModal.classList.remove(
                "hidden"
            );

            return;

        }


        const room =
            roomInput.value.trim();


        if (!room) {

            alert(
                "لطفاً کد اتاق را وارد کنید."
            );

            return;

        }


        roomId =
            room;


        socket.emit(
            "join-room",
            {
                roomId: roomId,
                name: myName
            }
        );


        status.textContent =
            `شما با نام ${myName} وارد اتاق ${roomId} شدید ❤️`;


        meStatus.textContent =
            "🟢";


        roomInput.disabled =
            true;


        joinBtn.disabled =
            true;


        chatInput.disabled =
            false;

    }
);


// =====================================
// تعداد کاربران
// =====================================

socket.on(
    "users-count",
    (count) => {

        if (count >= 2) {

            partnerStatus.textContent =
                "🟢";


            status.textContent =
                "هر دو نفر داخل اتاق هستند ❤️";

        }
        else {

            partnerStatus.textContent =
                "⚪";


            status.textContent =
                "منتظر ورود پارتنر...";

        }

    }
);


// =====================================
// PLAY / PAUSE (پلیر اختصاصی)
// =====================================

function togglePlayPause() {

    if (!video.src) {

        return;

    }


    if (video.paused) {

        video.play();

    }
    else {

        video.pause();

    }

}


playPauseBtn.addEventListener(
    "click",
    togglePlayPause
);


centerPlayBtn.addEventListener(
    "click",
    togglePlayPause
);


video.addEventListener(
    "click",
    togglePlayPause
);


video.addEventListener(
    "play",
    () => {

        playPauseIconPlay.classList.add(
            "hidden-icon"
        );

        playPauseIconPause.classList.remove(
            "hidden-icon"
        );


        centerPlayBtn.classList.add(
            "is-playing"
        );


        armControlsAutoHide();


        if (
            isRemoteAction ||
            !roomId
        ) {

            return;

        }


        socket.emit(
            "video-action",
            {

                roomId: roomId,

                type: "play",

                time:
                    video.currentTime

            }
        );

    }
);


video.addEventListener(
    "pause",
    () => {

        playPauseIconPlay.classList.remove(
            "hidden-icon"
        );

        playPauseIconPause.classList.add(
            "hidden-icon"
        );


        centerPlayBtn.classList.remove(
            "is-playing"
        );


        showControls();

        clearTimeout(
            controlsHideTimeout
        );


        if (
            isRemoteAction ||
            !roomId
        ) {

            return;

        }


        socket.emit(
            "video-action",
            {

                roomId: roomId,

                type: "pause",

                time:
                    video.currentTime

            }
        );

    }
);


// =====================================
// SEEK (رویداد بومی ویدیو)
// =====================================

video.addEventListener(
    "seeked",
    () => {

        if (
            isRemoteAction ||
            !roomId
        ) {

            return;

        }


        socket.emit(
            "video-action",
            {

                roomId: roomId,

                type: "seek",

                time:
                    video.currentTime

            }
        );

    }
);


// =====================================
// دریافت فرمان ویدیو
// =====================================

socket.on(
    "video-action",
    async (data) => {

        if (!video.src) {

            return;

        }


        isRemoteAction =
            true;


        try {

            if (
                data.type === "seek"
            ) {

                video.currentTime =
                    data.time;

            }


            if (
                data.type === "play"
            ) {

                video.currentTime =
                    data.time;

                await video.play();

            }


            if (
                data.type === "pause"
            ) {

                video.currentTime =
                    data.time;

                video.pause();

            }

        }
        catch (error) {

            console.log(
                "Video action error:",
                error
            );

        }


        setTimeout(
            () => {

                isRemoteAction =
                    false;

            },
            300
        );

    }
);


// =====================================
// نوار پیشرفت (Progress Bar)
// =====================================

function formatTime(seconds) {

    if (
        !isFinite(seconds) ||
        isNaN(seconds)
    ) {

        return "00:00";

    }


    const totalSeconds =
        Math.floor(seconds);

    const minutes =
        Math.floor(totalSeconds / 60);

    const secs =
        totalSeconds % 60;


    const pad =
        (n) => String(n).padStart(2, "0");


    return `${pad(minutes)}:${pad(secs)}`;

}


function updateProgressUI() {

    if (
        !video.duration ||
        isDraggingProgress
    ) {

        return;

    }


    const ratio =
        video.currentTime / video.duration;


    progressBarFilled.style.width =
        `${ratio * 100}%`;


    progressBarHandle.style.left =
        `${ratio * 100}%`;


    timeDisplay.textContent =
        `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

}


video.addEventListener(
    "timeupdate",
    updateProgressUI
);


video.addEventListener(
    "loadedmetadata",
    updateProgressUI
);


// نمایش بخش بافر شده

video.addEventListener(
    "progress",
    () => {

        if (
            !video.duration ||
            !video.buffered.length
        ) {

            return;

        }


        try {

            const bufferedEnd =
                video.buffered.end(
                    video.buffered.length - 1
                );


            const ratio =
                bufferedEnd / video.duration;


            progressBarBuffered.style.width =
                `${ratio * 100}%`;

        }
        catch (error) {

            // نادیده گرفتن خطای buffered

        }

    }
);


function seekFromClientX(clientX) {

    const rect =
        progressBarWrap.getBoundingClientRect();


    let ratio =
        (clientX - rect.left) / rect.width;


    ratio =
        Math.min(1, Math.max(0, ratio));


    progressBarFilled.style.width =
        `${ratio * 100}%`;


    progressBarHandle.style.left =
        `${ratio * 100}%`;


    if (video.duration) {

        video.currentTime =
            ratio * video.duration;

    }

}


progressBarWrap.addEventListener(
    "mousedown",
    (event) => {

        if (!video.src) return;

        isDraggingProgress = true;

        seekFromClientX(event.clientX);

    }
);


window.addEventListener(
    "mousemove",
    (event) => {

        if (!isDraggingProgress) return;

        seekFromClientX(event.clientX);

    }
);


window.addEventListener(
    "mouseup",
    () => {

        isDraggingProgress = false;

    }
);


// پشتیبانی از لمس (موبایل)

progressBarWrap.addEventListener(
    "touchstart",
    (event) => {

        if (!video.src) return;

        isDraggingProgress = true;

        seekFromClientX(
            event.touches[0].clientX
        );

    }
);


window.addEventListener(
    "touchmove",
    (event) => {

        if (!isDraggingProgress) return;

        seekFromClientX(
            event.touches[0].clientX
        );

    }
);


window.addEventListener(
    "touchend",
    () => {

        isDraggingProgress = false;

    }
);


// =====================================
// صدا (Volume)
// =====================================

function updateVolumeIcon() {

    const isMuted =
        video.muted ||
        video.volume === 0;


    volIconOn.classList.toggle(
        "hidden-icon",
        isMuted
    );


    volIconOff.classList.toggle(
        "hidden-icon",
        !isMuted
    );

}


volumeSlider.addEventListener(
    "input",
    () => {

        video.volume =
            Number(volumeSlider.value);


        video.muted =
            video.volume === 0;


        updateVolumeIcon();

    }
);


muteBtn.addEventListener(
    "click",
    () => {

        video.muted =
            !video.muted;


        if (
            !video.muted &&
            video.volume === 0
        ) {

            video.volume = 1;

            volumeSlider.value = 1;

        }


        updateVolumeIcon();

    }
);


updateVolumeIcon();


// =====================================
// تمام صفحه (Fullscreen)
// =====================================

function isCurrentlyFullscreen() {

    return Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement
    );

}


function updateFullscreenIcon() {

    const active =
        isCurrentlyFullscreen();


    expandIcon.classList.toggle(
        "hidden-icon",
        active
    );


    compressIcon.classList.toggle(
        "hidden-icon",
        !active
    );


    playerWrapper.classList.toggle(
        "is-fullscreen",
        active
    );

}


fullscreenBtn.addEventListener(
    "click",
    () => {

        if (!isCurrentlyFullscreen()) {

            if (playerWrapper.requestFullscreen) {

                playerWrapper.requestFullscreen();

            }
            else if (playerWrapper.webkitRequestFullscreen) {

                playerWrapper.webkitRequestFullscreen();

            }

        }
        else {

            if (document.exitFullscreen) {

                document.exitFullscreen();

            }
            else if (document.webkitExitFullscreen) {

                document.webkitExitFullscreen();

            }

        }

    }
);


document.addEventListener(
    "fullscreenchange",
    updateFullscreenIcon
);


document.addEventListener(
    "webkitfullscreenchange",
    updateFullscreenIcon
);


// =====================================
// مخفی/نمایش خودکار نوار کنترل
// =====================================

let controlsHideTimeout = null;


function showControls() {

    playerControls.classList.remove(
        "controls-hidden"
    );

}


function armControlsAutoHide() {

    showControls();


    clearTimeout(
        controlsHideTimeout
    );


    if (video.paused) {

        return;

    }


    controlsHideTimeout =
        setTimeout(
            () => {

                if (!video.paused) {

                    playerControls.classList.add(
                        "controls-hidden"
                    );

                }

            },
            2600
        );

}


playerWrapper.addEventListener(
    "mousemove",
    armControlsAutoHide
);


playerWrapper.addEventListener(
    "touchstart",
    armControlsAutoHide
);


playerControls.addEventListener(
    "mouseenter",
    () => {

        clearTimeout(
            controlsHideTimeout
        );

        showControls();

    }
);


// =====================================
// ری‌اکشن‌ها (Reactions)
// =====================================

reactionEmojiList.forEach((emoji) => {

    const btn =
        document.createElement("button");

    btn.type =
        "button";

    btn.textContent =
        emoji;

    btn.addEventListener(
        "click",
        () => {

            sendReaction(emoji);

            reactionPicker.classList.add(
                "hidden"
            );

        }
    );

    reactionPicker.appendChild(
        btn
    );

});


reactionBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        reactionPicker.classList.toggle(
            "hidden"
        );


        speedMenu.classList.add(
            "hidden"
        );


        reactionBtn.classList.remove(
            "pop"
        );

        void reactionBtn.offsetWidth;

        reactionBtn.classList.add(
            "pop"
        );

    }
);


document.addEventListener(
    "click",
    (event) => {

        if (
            !reactionPicker.contains(event.target) &&
            event.target !== reactionBtn
        ) {

            reactionPicker.classList.add(
                "hidden"
            );

        }

    }
);


function spawnReactionEmoji(emoji) {

    const randomLeft =
        10 + Math.random() * 75;


    // ایموجی اصلی

    const span =
        document.createElement("span");

    span.className =
        "reaction-emoji";

    span.textContent =
        emoji;


    const randomRotate =
        (Math.random() * 30 - 15).toFixed(1);


    span.style.left =
        `${randomLeft}%`;

    span.style.setProperty(
        "--rot",
        `${randomRotate}deg`
    );


    reactionsLayer.appendChild(
        span
    );


    setTimeout(
        () => {

            span.remove();

        },
        2300
    );


    // ذرات درخشان دور ایموجی

    for (let i = 0; i < 3; i++) {

        const sparkle =
            document.createElement("span");

        sparkle.className =
            "reaction-sparkle";

        sparkle.textContent =
            "✦";


        const sparkleLeft =
            randomLeft + (Math.random() * 16 - 8);


        const sparkleDelay =
            Math.random() * 0.3;


        const sparkleDrift =
            (Math.random() * 40 - 20).toFixed(0);


        sparkle.style.left =
            `${sparkleLeft}%`;

        sparkle.style.animationDelay =
            `${sparkleDelay}s`;

        sparkle.style.setProperty(
            "--drift",
            `${sparkleDrift}px`
        );


        reactionsLayer.appendChild(
            sparkle
        );


        setTimeout(
            () => {

                sparkle.remove();

            },
            1800
        );

    }

}


function sendReaction(emoji) {

    spawnReactionEmoji(emoji);


    if (roomId) {

        socket.emit(
            "video-reaction",
            {

                roomId: roomId,

                emoji: emoji

            }
        );

    }

}


socket.on(
    "video-reaction",
    (data) => {

        if (data && data.emoji) {

            spawnReactionEmoji(
                data.emoji
            );

        }

    }
);


// =====================================
// ارسال پیام
// =====================================

function sendChatMessage() {

    const message =
        chatInput.value.trim();


    if (!message) {

        return;

    }


    if (!roomId) {

        alert(
            "اول وارد اتاق شو."
        );

        return;

    }


    if (!myName) {

        alert(
            "اول هویت خودت را انتخاب کن."
        );

        return;

    }


    const messageData = {

        roomId: roomId,

        name: myName,

        message: message,

        time:
            new Date().toLocaleTimeString(
                "fa-IR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    };


    // نمایش پیام برای خودمان

    addChatMessage(
        messageData,
        true
    );


    // ارسال برای طرف مقابل

    socket.emit(
        "chat-message",
        messageData
    );


    chatInput.value = "";

    chatInput.focus();

}


// =====================================
// دکمه ارسال
// =====================================

sendChatBtn.addEventListener(
    "click",
    sendChatMessage
);


// =====================================
// Enter
// =====================================

chatInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendChatMessage();

        }

    }
);


// =====================================
// دریافت پیام طرف مقابل
// =====================================

socket.on(
    "chat-message",
    (data) => {

        addChatMessage(
            data,
            false
        );


        showChatNotification(
            data
        );


        playMessageSound();

    }
);


// =====================================
// اضافه کردن پیام به Chat
// =====================================

function addChatMessage(
    data,
    isMine
) {

    if (chatEmpty) {

        chatEmpty.remove();

    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        isMine
            ? "chat-message mine"
            : "chat-message theirs";


    const nameElement =
        document.createElement(
            "div"
        );


    nameElement.className =
        "chat-message-name";


    nameElement.textContent =
        data.name;


    const textElement =
        document.createElement(
            "div"
        );


    textElement.className =
        "chat-message-text";


    textElement.textContent =
        data.message;


    const timeElement =
        document.createElement(
            "div"
        );


    timeElement.className =
        "chat-message-time";


    timeElement.textContent =
        data.time || "";


    messageElement.appendChild(
        nameElement
    );


    messageElement.appendChild(
        textElement
    );


    messageElement.appendChild(
        timeElement
    );


    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// =====================================
// Notification
// =====================================

function showChatNotification(
    data
) {

    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "chat-notification";


    notification.innerHTML = `

        <div class="notification-icon">
            💬
        </div>

        <div class="notification-content">

            <div class="notification-name">
                ${escapeHTML(data.name)}
            </div>

            <div class="notification-message">
                ${escapeHTML(data.message)}
            </div>

        </div>

    `;


    chatNotifications.appendChild(
        notification
    );


    requestAnimationFrame(
        () => {

            notification.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    notification.remove();

                },
                400
            );

        },
        3500
    );

}


// =====================================
// جلوگیری از HTML Injection
// =====================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// =====================================
// صدای پیام
// =====================================

function playMessageSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            return;

        }


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.setValueAtTime(
            700,
            audioContext.currentTime
        );


        oscillator.frequency.exponentialRampToValueAtTime(
            1000,
            audioContext.currentTime + 0.08
        );


        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.12,
            audioContext.currentTime + 0.01
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.18
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.18
        );

    }
    catch (error) {

        console.log(
            "Notification sound error:",
            error
        );

    }

}


// =====================================
// Emoji Picker (چت)
// =====================================

const emojiList = [
    "😀", "😂", "🥰", "😍", "😘", "😉",
    "😎", "🤩", "😢", "😭", "😡", "😴",
    "🤔", "😅", "😇", "🙃", "😳", "🥳",
    "👍", "👎", "👏", "🙏", "💪", "✌️",
    "❤️", "🧡", "💛", "💚", "💙", "💜",
    "🔥", "✨", "🎉", "🎬", "🍿", "☕",
    "🌙", "⭐", "🌸", "🥺", "😏", "😜"
];


emojiList.forEach((emoji) => {

    const emojiSpan =
        document.createElement("span");

    emojiSpan.textContent =
        emoji;

    emojiSpan.addEventListener(
        "click",
        () => {

            chatInput.value +=
                emoji;

            chatInput.focus();

        }
    );

    emojiPanel.appendChild(
        emojiSpan
    );

});


emojiBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        emojiPanel.classList.toggle(
            "hidden"
        );

    }
);


// بستن پنل با کلیک بیرون از آن

document.addEventListener(
    "click",
    (event) => {

        if (
            !emojiPanel.contains(event.target) &&
            event.target !== emojiBtn
        ) {

            emojiPanel.classList.add(
                "hidden"
            );

        }

    }
);