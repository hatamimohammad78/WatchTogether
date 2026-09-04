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
// Emoji Picker
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
// Variables
// =====================================

let videoUrl = null;

let roomId = null;

let myName = null;


// جلوگیری از ارسال دوباره
// فرمانی که از طرف مقابل آمده

let isRemoteAction = false;


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
// PLAY
// =====================================

video.addEventListener(
    "play",
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

                type: "play",

                time:
                    video.currentTime

            }
        );

    }
);


// =====================================
// PAUSE
// =====================================

video.addEventListener(
    "pause",
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

                type: "pause",

                time:
                    video.currentTime

            }
        );

    }
);


// =====================================
// SEEK
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
// Emoji Picker
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