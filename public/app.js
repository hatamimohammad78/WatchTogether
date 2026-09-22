const socket = io();


// =====================================
// عناصر صفحه
// =====================================

const video =
    document.getElementById("video");

const fileInput =
    document.getElementById("fileInput");

const status =
    document.getElementById("status");


// =====================================
// مودال ورود
// =====================================

const entryModal =
    document.getElementById("entryModal");

const entryNameInput =
    document.getElementById("entryNameInput");

const entryRoomInput =
    document.getElementById("entryRoomInput");

const entryJoinBtn =
    document.getElementById("entryJoinBtn");


// =====================================
// نوار اتاق
// =====================================

const roomCodeDisplay =
    document.getElementById("roomCodeDisplay");

const shareRoomBtn =
    document.getElementById("shareRoomBtn");

const usersToggleBtn =
    document.getElementById("usersToggleBtn");

const usersCountBadge =
    document.getElementById("usersCountBadge");

const usersPanel =
    document.getElementById("usersPanel");


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
    document.getElementById("chatNotifications");

const chatIdentity =
    document.getElementById("chatIdentity");


// =====================================
// Emoji
// =====================================

const emojiBtn =
    document.getElementById("emojiBtn");

const emojiPanel =
    document.getElementById("emojiPanel");


// =====================================
// Subtitle
// =====================================

const subtitleInput =
    document.getElementById("subtitleInput");

const subtitleRemoveBtn =
    document.getElementById("subtitleRemoveBtn");

let subtitleUrl = null;
let subtitleTrackElement = null;
let originalCueTimes = [];
let subtitleOffsetSeconds = 0;


// =====================================
// Player
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

const rewind15Btn =
    document.getElementById("rewind15Btn");

const forward15Btn =
    document.getElementById("forward15Btn");

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
// Voice indicators
// =====================================

const selfVoiceIndicator =
    document.getElementById("selfVoiceIndicator");

const partnerVoiceIndicator =
    document.getElementById("partnerVoiceIndicator");

const partnerVoiceIndicatorText =
    document.getElementById("partnerVoiceIndicatorText");


// =====================================
// Variables اصلی
// =====================================

let videoUrl = null;
let roomId = null;
let myName = null;

let chatHistory = [];

let isDraggingProgress = false;


// =====================================
// کنترل جلوگیری از Loop سینک
// =====================================

// رویدادهای محلی که توسط فرمان Remote ایجاد شده‌اند
let ignoreNextPlay = false;
let ignoreNextPause = false;
let ignoreNextSeeked = false;


// وقتی Remote Action در حال اجراست
let isApplyingRemoteAction = false;


// =====================================
// Speed
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

    item.type = "button";

    item.textContent = `${speed}×`;

    item.dataset.speed = speed;

    if (speed === 1) {
        item.classList.add("active");
    }

    item.addEventListener("click", () => {

        setPlaybackRate(speed);

        speedMenu.classList.add("hidden");

    });

    speedMenu.appendChild(item);

});


function setPlaybackRate(speed) {

    currentSpeed = speed;

    video.playbackRate = speed;

    speedBtn.textContent = `${speed}×`;

    speedMenu
        .querySelectorAll("button")
        .forEach((btn) => {

            btn.classList.toggle(
                "active",
                Number(btn.dataset.speed) === speed
            );

        });

}


speedBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    const willOpen =
        speedMenu.classList.contains("hidden");

    closeAllPopupsExcept(
        willOpen ? "speed" : null
    );

    speedMenu.classList.toggle(
        "hidden",
        !willOpen
    );

});


// =====================================
// مدیریت Popup ها
// =====================================

function closeAllPopupsExcept(exceptName) {

    if (exceptName !== "speed") {
        speedMenu.classList.add("hidden");
    }

    if (exceptName !== "subtitle") {
        subtitleSettingsPanel.classList.add("hidden");
    }

    if (exceptName !== "chat") {
        miniChatPanel.classList.add("hidden");
    }

    if (exceptName !== "emoji") {
        emojiPanel.classList.add("hidden");
    }

}


// =====================================
// Reactions
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

let reactionPanelActive = false;


reactionEmojiList.forEach((emoji) => {

    const btn =
        document.createElement("button");

    btn.type = "button";

    btn.textContent = emoji;

    btn.addEventListener("click", () => {

        sendReaction(emoji);

    });

    reactionPicker.appendChild(btn);

});


reactionBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    reactionPanelActive =
        !reactionPanelActive;

    reactionBtn.classList.toggle(
        "active",
        reactionPanelActive
    );

    reactionPicker.classList.toggle(
        "hidden",
        !reactionPanelActive
    );

    if (reactionPanelActive) {
        closeAllPopupsExcept("reaction");
    }

});


function spawnReactionEmoji(emoji) {

    const randomLeft =
        10 + Math.random() * 75;

    const span =
        document.createElement("span");

    span.className =
        "reaction-emoji";

    span.textContent =
        emoji;

    span.style.left =
        `${randomLeft}%`;

    span.style.setProperty(
        "--rot",
        `${(Math.random() * 30 - 15).toFixed(1)}deg`
    );

    reactionsLayer.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 2300);


    for (let i = 0; i < 3; i++) {

        const sparkle =
            document.createElement("span");

        sparkle.className =
            "reaction-sparkle";

        sparkle.textContent =
            "✦";

        sparkle.style.left =
            `${randomLeft + (Math.random() * 16 - 8)}%`;

        sparkle.style.animationDelay =
            `${Math.random() * 0.3}s`;

        sparkle.style.setProperty(
            "--drift",
            `${(Math.random() * 40 - 20).toFixed(0)}px`
        );

        reactionsLayer.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1800);

    }

}


function sendReaction(emoji) {

    spawnReactionEmoji(emoji);

    if (roomId) {

        socket.emit(
            "video-reaction",
            {
                roomId,
                emoji
            }
        );

    }

}


socket.on("video-reaction", (data) => {

    if (data && data.emoji) {
        spawnReactionEmoji(data.emoji);
    }

});


// =====================================
// Subtitle Settings
// =====================================

const subtitleSettingsBtn =
    document.getElementById("subtitleSettingsBtn");

const subtitleSettingsPanel =
    document.getElementById("subtitleSettingsPanel");

const subtitleFontSizeSlider =
    document.getElementById("subtitleFontSizeSlider");

const subtitleColorSwatches =
    document.getElementById("subtitleColorSwatches");

const subtitleBgOpacitySlider =
    document.getElementById("subtitleBgOpacitySlider");

const subtitleOffsetDisplay =
    document.getElementById("subtitleOffsetDisplay");

const subtitleOffsetMinusBtn =
    document.getElementById("subtitleOffsetMinusBtn");

const subtitleOffsetPlusBtn =
    document.getElementById("subtitleOffsetPlusBtn");

let subtitleFontSize = 20;
let subtitleColor = "#ffffff";
let subtitleBgOpacity = 0.6;


const subtitleColorOptions = [
    "#ffffff",
    "#ffe066",
    "#7be0ff",
    "#ff9bd0",
    "#baff6b"
];


const subtitleStyleTag =
    document.createElement("style");

subtitleStyleTag.id =
    "subtitleStyleTag";

document.head.appendChild(
    subtitleStyleTag
);


function updateSubtitleStyleTag() {

    subtitleStyleTag.textContent = `
        #video::cue {
            color: ${subtitleColor};
            font-size: ${subtitleFontSize}px;
            background-color: rgba(0, 0, 0, ${subtitleBgOpacity});
        }
    `;

}


subtitleColorOptions.forEach((color) => {

    const swatch =
        document.createElement("button");

    swatch.type = "button";

    swatch.className =
        "subtitle-color-swatch";

    swatch.style.background =
        color;

    if (color === subtitleColor) {
        swatch.classList.add("active");
    }

    swatch.addEventListener("click", () => {

        subtitleColor = color;

        subtitleColorSwatches
            .querySelectorAll(".subtitle-color-swatch")
            .forEach((el) => {
                el.classList.remove("active");
            });

        swatch.classList.add("active");

        updateSubtitleStyleTag();

    });

    subtitleColorSwatches.appendChild(swatch);

});


subtitleFontSizeSlider.addEventListener("input", () => {

    subtitleFontSize =
        Number(subtitleFontSizeSlider.value);

    updateSubtitleStyleTag();

});


subtitleBgOpacitySlider.addEventListener("input", () => {

    subtitleBgOpacity =
        Number(subtitleBgOpacitySlider.value);

    updateSubtitleStyleTag();

});


function updateSubtitleOffsetDisplay() {

    subtitleOffsetDisplay.textContent =
        `${subtitleOffsetSeconds.toFixed(1)} ثانیه`;

}


function applySubtitleOffset() {

    originalCueTimes.forEach((item) => {

        item.cue.startTime =
            Math.max(
                0,
                item.start + subtitleOffsetSeconds
            );

        item.cue.endTime =
            Math.max(
                0,
                item.end + subtitleOffsetSeconds
            );

    });

}


subtitleOffsetMinusBtn.addEventListener("click", () => {

    subtitleOffsetSeconds -= 0.5;

    applySubtitleOffset();

    updateSubtitleOffsetDisplay();

});


subtitleOffsetPlusBtn.addEventListener("click", () => {

    subtitleOffsetSeconds += 0.5;

    applySubtitleOffset();

    updateSubtitleOffsetDisplay();

});


subtitleSettingsBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    const willOpen =
        subtitleSettingsPanel.classList.contains("hidden");

    closeAllPopupsExcept(
        willOpen ? "subtitle" : null
    );

    subtitleSettingsPanel.classList.toggle(
        "hidden",
        !willOpen
    );

});


updateSubtitleStyleTag();


// =====================================
// حذف زیرنویس
// =====================================

subtitleRemoveBtn.addEventListener("click", () => {

    if (subtitleUrl) {

        URL.revokeObjectURL(
            subtitleUrl
        );

        subtitleUrl = null;

    }

    if (subtitleTrackElement) {

        subtitleTrackElement.remove();

        subtitleTrackElement = null;

    }

    originalCueTimes = [];

    subtitleOffsetSeconds = 0;

    updateSubtitleOffsetDisplay();

    subtitleInput.value = "";

    status.textContent =
        "زیرنویس حذف شد 🗑️";

});


// =====================================
// Mini Chat
// =====================================

const chatToggleBtn =
    document.getElementById("chatToggleBtn");

const miniChatPanel =
    document.getElementById("miniChatPanel");

const miniChatMessages =
    document.getElementById("miniChatMessages");

const miniChatInput =
    document.getElementById("miniChatInput");

const miniChatSendBtn =
    document.getElementById("miniChatSendBtn");


chatToggleBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    const willOpen =
        miniChatPanel.classList.contains("hidden");

    closeAllPopupsExcept(
        willOpen ? "chat" : null
    );

    miniChatPanel.classList.toggle(
        "hidden",
        !willOpen
    );

});


function renderMiniChat() {

    const lastThree =
        chatHistory.slice(-3);

    if (lastThree.length === 0) {

        miniChatMessages.innerHTML =
            `<div class="mini-chat-empty">هنوز پیامی نیست</div>`;

        return;

    }

    miniChatMessages.innerHTML =
        lastThree
            .map((item) => `
                <div class="mini-chat-message ${item.mine ? "mine" : "theirs"}">
                    <span class="mini-chat-name">${escapeHTML(item.name)}</span>
                    <span class="mini-chat-text">${escapeHTML(item.message)}</span>
                </div>
            `)
            .join("");

    miniChatMessages.scrollTop =
        miniChatMessages.scrollHeight;

}


function sendChatFrom(inputElement) {

    const message =
        inputElement.value.trim();

    if (!message) {
        return;
    }

    if (!roomId) {
        alert("اول وارد اتاق شو.");
        return;
    }

    if (!myName) {
        alert("اول نام خودت را وارد کن.");
        return;
    }

    const messageData = {

        roomId,
        name: myName,
        message,

        time:
            new Date().toLocaleTimeString(
                "fa-IR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    };

    addChatMessage(
        messageData,
        true
    );

    socket.emit(
        "chat-message",
        messageData
    );

    inputElement.value = "";

    inputElement.focus();

}


miniChatSendBtn.addEventListener("click", () => {

    sendChatFrom(
        miniChatInput
    );

});


miniChatInput.addEventListener("keydown", (event) => {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendChatFrom(
            miniChatInput
        );

    }

});


// =====================================
// Voice WebRTC - نسخه اصلاح شده
// =====================================

const voiceBtn =
    document.getElementById("voiceBtn");

let localStream = null;
let peerConnection = null;
let partnerSocketId = null;


// =====================================
// صف ICE Candidate
// =====================================

// Candidate ممکن است قبل از ساخته‌شدن PeerConnection
// یا قبل از setRemoteDescription برسد.
// در این حالت موقتاً ذخیره می‌شود.
let pendingIceCandidates = [];


// =====================================
// Remote Audio
// =====================================

const remoteAudio =
    new Audio();

remoteAudio.autoplay = true;
remoteAudio.muted = false;
remoteAudio.volume = 1;
remoteAudio.playsInline = true;

document.body.appendChild(
    remoteAudio
);


function tryPlayRemoteAudio() {

    if (!remoteAudio.srcObject) {
        return;
    }

    remoteAudio
        .play()
        .catch((error) => {

            console.log(
                "Remote audio play waiting for user interaction:",
                error
            );

        });

}


document.addEventListener(
    "click",
    tryPlayRemoteAudio,
    { once: true }
);


// =====================================
// WebRTC Configuration
// =====================================

const rtcConfig = {

    iceServers: [

        {
            urls:
                "stun:stun.l.google.com:19302"
        },

        {
            urls:
                "stun:stun.cloudflare.com:3478"
        }

    ]

};


// =====================================
// دریافت Microphone
// =====================================

async function ensureLocalStream() {

    if (localStream) {
        return localStream;
    }

    try {

        localStream =
            await navigator.mediaDevices.getUserMedia({

                audio: {

                    echoCancellation: true,

                    noiseSuppression: true,

                    autoGainControl: true

                }

            });


        localStream
            .getAudioTracks()
            .forEach((track) => {

                track.enabled = false;

            });


        console.log(
            "Microphone stream ready."
        );


        return localStream;

    }
    catch (error) {

        console.log(
            "Microphone permission error:",
            error
        );

        status.textContent =
            "دسترسی به میکروفون داده نشد ❌";

        return null;

    }

}


// =====================================
// اضافه کردن Candidateهای منتظر
// =====================================

async function flushPendingIceCandidates() {

    if (
        !peerConnection ||
        !peerConnection.remoteDescription
    ) {

        return;

    }


    if (
        pendingIceCandidates.length === 0
    ) {

        return;

    }


    const candidates =
        [...pendingIceCandidates];

    pendingIceCandidates = [];


    for (
        const candidate of candidates
    ) {

        try {

            await peerConnection.addIceCandidate(
                candidate
            );

            console.log(
                "Queued ICE candidate added successfully."
            );

        }
        catch (error) {

            console.log(
                "Queued ICE candidate error:",
                error
            );

        }

    }

}


// =====================================
// ساخت Peer Connection
// =====================================

function createPeerConnection() {

    if (peerConnection) {

        try {
            peerConnection.close();
        }
        catch (error) {}

    }


    peerConnection =
        new RTCPeerConnection(
            rtcConfig
        );


    console.log(
        "New RTCPeerConnection created."
    );


    // =================================
    // ICE Candidate
    // =================================

    peerConnection.onicecandidate =
        (event) => {

            if (
                event.candidate &&
                partnerSocketId
            ) {

                console.log(
                    "Sending ICE candidate to:",
                    partnerSocketId
                );


                socket.emit(
                    "webrtc-ice-candidate",
                    {

                        to:
                            partnerSocketId,

                        candidate:
                            event.candidate

                    }
                );

            }

        };


    // =================================
    // Remote Track
    // =================================

    peerConnection.ontrack =
        (event) => {

            console.log(
                "Remote audio track received."
            );


            if (
                event.streams &&
                event.streams[0]
            ) {

                remoteAudio.srcObject =
                    event.streams[0];

                tryPlayRemoteAudio();

            }

        };


    // =================================
    // ICE Connection State
    // =================================

    peerConnection.oniceconnectionstatechange =
        () => {

            if (!peerConnection) {
                return;
            }


            const state =
                peerConnection.iceConnectionState;


            console.log(
                "ICE connection state:",
                state
            );


            if (state === "connected") {

                console.log(
                    "WebRTC ICE connected successfully."
                );

            }


            if (state === "completed") {

                console.log(
                    "WebRTC ICE connection completed."
                );

            }


            if (state === "failed") {

                console.log(
                    "WebRTC ICE connection failed."
                );

            }


            if (state === "disconnected") {

                console.log(
                    "WebRTC ICE temporarily disconnected."
                );

            }

        };


    // =================================
    // Overall Connection State
    // =================================

    peerConnection.onconnectionstatechange =
        () => {

            if (!peerConnection) {
                return;
            }


            const state =
                peerConnection.connectionState;


            console.log(
                "Peer connection state:",
                state
            );


            if (state === "connected") {

                console.log(
                    "🎙️ Voice connection established."
                );

            }


            if (state === "failed") {

                console.log(
                    "❌ Voice connection failed."
                );

            }

        };

}


// =====================================
// اضافه کردن Trackهای میکروفون
// =====================================

async function attachLocalTracks() {

    if (
        !peerConnection ||
        !localStream
    ) {

        return;

    }


    localStream
        .getTracks()
        .forEach((track) => {

            const alreadyAdded =
                peerConnection
                    .getSenders()
                    .find(
                        (sender) =>
                            sender.track === track
                    );


            if (!alreadyAdded) {

                peerConnection.addTrack(
                    track,
                    localStream
                );

            }

        });

}


// =====================================
// WebRTC Signaling
// =====================================


// =====================================
// Existing Peer
// =====================================

socket.on(
    "existing-peer",
    async (data) => {

        if (
            !data ||
            !data.peerId
        ) {

            return;

        }


        // اگر Peer جدید است، Candidateهای قدیمی
        // مربوط به Peer قبلی نباید استفاده شوند.
        if (
            partnerSocketId &&
            partnerSocketId !== data.peerId
        ) {

            pendingIceCandidates = [];

        }


        partnerSocketId =
            data.peerId;


        console.log(
            "Existing peer:",
            partnerSocketId
        );


        const stream =
            await ensureLocalStream();


        if (!stream) {
            return;
        }


        createPeerConnection();


        await attachLocalTracks();


        try {

            const offer =
                await peerConnection.createOffer();


            await peerConnection.setLocalDescription(
                offer
            );


            console.log(
                "Sending WebRTC offer."
            );


            socket.emit(
                "webrtc-offer",
                {

                    to:
                        partnerSocketId,

                    offer:
                        offer

                }
            );

        }
        catch (error) {

            console.log(
                "WebRTC offer error:",
                error
            );

        }

    }
);


// =====================================
// دریافت Offer
// =====================================

socket.on(
    "webrtc-offer",
    async (data) => {

        if (
            !data ||
            !data.from ||
            !data.offer
        ) {

            return;

        }


        if (
            partnerSocketId &&
            partnerSocketId !== data.from
        ) {

            pendingIceCandidates = [];

        }


        partnerSocketId =
            data.from;


        console.log(
            "Received WebRTC offer from:",
            partnerSocketId
        );


        const stream =
            await ensureLocalStream();


        if (!stream) {
            return;
        }


        if (!peerConnection) {

            createPeerConnection();

        }


        try {

            // بسیار مهم:
            // ابتدا Remote Description تنظیم می‌شود.
            await peerConnection.setRemoteDescription(
                data.offer
            );


            console.log(
                "Remote offer description set."
            );


            // حالا Candidateهایی که زودتر رسیده‌اند
            // قابل اضافه شدن هستند.
            await flushPendingIceCandidates();


            await attachLocalTracks();


            const answer =
                await peerConnection.createAnswer();


            await peerConnection.setLocalDescription(
                answer
            );


            console.log(
                "Sending WebRTC answer."
            );


            socket.emit(
                "webrtc-answer",
                {

                    to:
                        partnerSocketId,

                    answer:
                        answer

                }
            );

        }
        catch (error) {

            console.log(
                "WebRTC answer error:",
                error
            );

        }

    }
);


// =====================================
// دریافت Answer
// =====================================

socket.on(
    "webrtc-answer",
    async (data) => {

        if (
            !peerConnection ||
            !data ||
            !data.answer
        ) {

            return;

        }


        try {

            await peerConnection.setRemoteDescription(
                data.answer
            );


            console.log(
                "Remote answer description set."
            );


            // حالا Candidateهای منتظر را اضافه می‌کنیم.
            await flushPendingIceCandidates();

        }
        catch (error) {

            console.log(
                "WebRTC set remote answer error:",
                error
            );

        }

    }
);


// =====================================
// دریافت ICE Candidate
// =====================================

socket.on(
    "webrtc-ice-candidate",
    async (data) => {

        if (
            !data ||
            !data.candidate
        ) {

            return;

        }


        console.log(
            "Received ICE candidate."
        );


        // ---------------------------------
        // اگر PeerConnection هنوز ساخته نشده
        // ---------------------------------

        if (!peerConnection) {

            console.log(
                "PeerConnection not ready. ICE candidate queued."
            );


            pendingIceCandidates.push(
                data.candidate
            );


            return;

        }


        // ---------------------------------
        // اگر Remote Description هنوز تنظیم نشده
        // ---------------------------------

        if (
            !peerConnection.remoteDescription
        ) {

            console.log(
                "Remote description not ready. ICE candidate queued."
            );


            pendingIceCandidates.push(
                data.candidate
            );


            return;

        }


        // ---------------------------------
        // Remote Description آماده است
        // ---------------------------------

        try {

            await peerConnection.addIceCandidate(
                data.candidate
            );


            console.log(
                "ICE candidate added successfully."
            );

        }
        catch (error) {

            console.log(
                "WebRTC ICE candidate error:",
                error
            );

        }

    }
);


// =====================================
// بستن Voice Connection
// =====================================

function closeVoiceConnection() {

    console.log(
        "Closing voice connection."
    );


    if (peerConnection) {

        try {

            peerConnection.close();

        }
        catch (error) {}

        peerConnection = null;

    }


    partnerSocketId = null;


    // Candidateهای قبلی دیگر معتبر نیستند.
    pendingIceCandidates = [];


    remoteAudio.srcObject = null;


    voiceBtn.classList.remove(
        "active"
    );


    selfVoiceIndicator.classList.add(
        "hidden"
    );


    partnerVoiceIndicator.classList.add(
        "hidden"
    );

}


// =====================================
// شروع صحبت
// =====================================

async function startTalking(event) {

    event.preventDefault();


    // اگر میکروفون هنوز گرفته نشده،
    // همین‌جا درخواست می‌کنیم.
    const stream =
        await ensureLocalStream();


    if (!stream) {
        return;
    }


    // همان لحظه میکروفون فعال می‌شود.
    stream
        .getAudioTracks()
        .forEach((track) => {

            track.enabled = true;

        });


    voiceBtn.classList.add(
        "active"
    );


    selfVoiceIndicator.classList.remove(
        "hidden"
    );


    // برای جلوگیری از مشکل autoplay
    // در موبایل، در همان تعامل کاربر تلاش می‌کنیم.
    tryPlayRemoteAudio();


    if (roomId) {

        socket.emit(
            "voice-status",
            {

                roomId,

                speaking:
                    true

            }
        );

    }

}


// =====================================
// توقف صحبت
// =====================================

function stopTalking() {

    if (localStream) {

        localStream
            .getAudioTracks()
            .forEach((track) => {

                track.enabled = false;

            });

    }


    voiceBtn.classList.remove(
        "active"
    );


    selfVoiceIndicator.classList.add(
        "hidden"
    );


    if (roomId) {

        socket.emit(
            "voice-status",
            {

                roomId,

                speaking:
                    false

            }
        );

    }

}


// =====================================
// Push To Talk
// =====================================

voiceBtn.addEventListener(
    "pointerdown",
    startTalking
);


voiceBtn.addEventListener(
    "pointerup",
    stopTalking
);


voiceBtn.addEventListener(
    "pointerleave",
    stopTalking
);


voiceBtn.addEventListener(
    "pointercancel",
    stopTalking
);


voiceBtn.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


// =====================================
// Voice Status
// =====================================

socket.on(
    "voice-status",
    (data) => {

        if (
            data &&
            data.speaking
        ) {

            partnerVoiceIndicatorText.textContent =
                `${data.name} در حال صحبت کردن`;


            partnerVoiceIndicator.classList.remove(
                "hidden"
            );


            tryPlayRemoteAudio();

        }
        else {

            partnerVoiceIndicator.classList.add(
                "hidden"
            );

        }

    }
);


// =====================================
// ورود به اتاق
// =====================================

function enterRoom() {

    const name =
        entryNameInput.value.trim();

    const room =
        entryRoomInput.value.trim();

    if (!name) {

        alert(
            "لطفاً نام خود را وارد کنید."
        );

        return;

    }

    if (!room) {

        alert(
            "لطفاً کد اتاق را وارد کنید."
        );

        return;

    }

    myName = name;
    roomId = room;

    chatIdentity.textContent =
        `شما: ${myName}`;

    roomCodeDisplay.textContent =
        roomId;

    entryModal.classList.add(
        "hidden"
    );

    tryPlayRemoteAudio();

    socket.emit(
        "join-room",
        {
            roomId,
            name: myName
        }
    );

    status.textContent =
        `شما با نام ${myName} وارد اتاق ${roomId} شدید ❤️`;

    chatInput.disabled = false;

}


entryJoinBtn.addEventListener(
    "click",
    enterRoom
);


entryRoomInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            enterRoom();

        }

    }
);


entryNameInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            entryRoomInput.focus();

        }

    }
);


// =====================================
// Share room
// =====================================

shareRoomBtn.addEventListener(
    "click",
    async () => {

        if (!roomId) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                roomId
            );

            status.textContent =
                "کد اتاق کپی شد ✅";

        }
        catch (error) {

            console.log(
                "Clipboard error:",
                error
            );

        }

    }
);


// =====================================
// کاربران آنلاین
// =====================================

function renderUsersPanel(users) {

    if (
        !users ||
        users.length === 0
    ) {

        usersPanel.innerHTML =
            `<div class="users-panel-empty">کسی آنلاین نیست</div>`;

        return;

    }

    usersPanel.innerHTML =
        users
            .map((user) => `
                <div class="users-panel-item">
                    <span class="users-panel-dot"></span>
                    <span>
                        ${escapeHTML(user.name)}
                        ${user.id === socket.id ? " (شما)" : ""}
                    </span>
                </div>
            `)
            .join("");

}


usersToggleBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        usersPanel.classList.toggle(
            "hidden"
        );

    }
);


socket.on("room-users", (data) => {

    usersCountBadge.textContent =
        data.count;

    renderUsersPanel(
        data.users
    );

    if (data.count >= 2) {

        status.textContent =
            "هر دو نفر داخل اتاق هستید ❤️";

    }
    else {

        status.textContent =
            "منتظر ورود پارتنر...";

        closeVoiceConnection();

    }

});


// =====================================
// پیام سیستمی
// =====================================

function addSystemChatMessage(text) {

    if (chatEmpty) {
        chatEmpty.remove();
    }

    const el =
        document.createElement("div");

    el.className =
        "chat-message system";

    el.textContent =
        text;

    chatMessages.appendChild(el);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


socket.on("system-message", (data) => {

    if (
        data &&
        data.text
    ) {

        addSystemChatMessage(
            data.text
        );

    }

});


// =====================================
// انتخاب فیلم
// =====================================

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0];

        if (!file) {
            return;
        }

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
// SRT → VTT
// =====================================

function convertSrtToVtt(srtText) {

    return (
        "WEBVTT\n\n" +
        srtText
            .replace(/\r+/g, "")
            .replace(
                /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
                "$1.$2"
            )
    );

}


// =====================================
// انتخاب زیرنویس
// =====================================

subtitleInput.addEventListener(
    "change",
    async () => {

        const file =
            subtitleInput.files[0];

        if (!file) {
            return;
        }

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

        if (subtitleUrl) {

            URL.revokeObjectURL(
                subtitleUrl
            );

        }

        if (subtitleTrackElement) {

            subtitleTrackElement.remove();

        }

        originalCueTimes = [];
        subtitleOffsetSeconds = 0;

        updateSubtitleOffsetDisplay();

        const blob =
            new Blob(
                [vttText],
                { type: "text/vtt" }
            );

        subtitleUrl =
            URL.createObjectURL(blob);

        subtitleTrackElement =
            document.createElement("track");

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

        subtitleTrackElement.addEventListener(
            "load",
            () => {
                captureOriginalCueTimes();
            }
        );

        video.appendChild(
            subtitleTrackElement
        );

        setTimeout(() => {

            const track =
                video.textTracks[
                    video.textTracks.length - 1
                ];

            if (track) {
                track.mode = "showing";
            }

            if (originalCueTimes.length === 0) {
                captureOriginalCueTimes();
            }

        }, 150);

        status.textContent =
            `زیرنویس "${file.name}" فعال شد ✅`;

    }
);


function captureOriginalCueTimes() {

    const track =
        video.textTracks[
            video.textTracks.length - 1
        ];

    if (
        !track ||
        !track.cues
    ) {
        return;
    }

    originalCueTimes = [];

    for (
        let i = 0;
        i < track.cues.length;
        i++
    ) {

        const cue =
            track.cues[i];

        originalCueTimes.push({
            cue,
            start: cue.startTime,
            end: cue.endTime
        });

    }

}


// =====================================
// PLAY / PAUSE
// =====================================

function togglePlayPause() {

    if (!video.src) {
        return;
    }

    if (video.paused) {
        video.play().catch(() => {});
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


// =====================================
// ۱۵ ثانیه
// =====================================

rewind15Btn.addEventListener(
    "click",
    () => {

        if (!video.src) {
            return;
        }

        video.currentTime =
            Math.max(
                0,
                video.currentTime - 15
            );

    }
);


forward15Btn.addEventListener(
    "click",
    () => {

        if (!video.src) {
            return;
        }

        const maxTime =
            video.duration || Infinity;

        video.currentTime =
            Math.min(
                maxTime,
                video.currentTime + 15
            );

    }
);


// =====================================
// PLAY EVENT
// =====================================

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


        if (ignoreNextPlay) {

            ignoreNextPlay = false;

            return;

        }


        if (isApplyingRemoteAction) {
            return;
        }


        if (!roomId) {
            return;
        }


        socket.emit(
            "video-action",
            {
                roomId,
                type: "play",
                time: video.currentTime
            }
        );

    }
);


// =====================================
// PAUSE EVENT
// =====================================

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


        if (ignoreNextPause) {

            ignoreNextPause = false;

            return;

        }


        if (isApplyingRemoteAction) {
            return;
        }


        if (!roomId) {
            return;
        }


        socket.emit(
            "video-action",
            {
                roomId,
                type: "pause",
                time: video.currentTime
            }
        );

    }
);


// =====================================
// SEEK EVENT
// =====================================

video.addEventListener(
    "seeked",
    () => {

        // هنگام Drag هیچ فرمانی ارسال نمی‌شود
        if (isDraggingProgress) {
            return;
        }

        // seek ایجادشده توسط Remote
        if (ignoreNextSeeked) {

            ignoreNextSeeked = false;

            return;

        }

        if (isApplyingRemoteAction) {
            return;
        }

        if (!roomId) {
            return;
        }


        socket.emit(
            "video-action",
            {
                roomId,
                type: "seek",
                time: video.currentTime
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

        if (
            !video.src ||
            !data ||
            !Number.isFinite(Number(data.time))
        ) {
            return;
        }


        isApplyingRemoteAction = true;


        try {

            const remoteTime =
                Math.max(
                    0,
                    Number(data.time)
                );


            if (data.type === "seek") {

                ignoreNextSeeked = true;

                video.currentTime =
                    remoteTime;

            }


            else if (data.type === "play") {

                ignoreNextSeeked = true;
                ignoreNextPlay = true;

                video.currentTime =
                    remoteTime;

                await video.play();

            }


            else if (data.type === "pause") {

                ignoreNextSeeked = true;
                ignoreNextPause = true;

                video.currentTime =
                    remoteTime;

                video.pause();

            }

        }
        catch (error) {

            console.log(
                "Video action error:",
                error
            );

        }
        finally {

            // کمی فرصت برای تکمیل eventهای native
            setTimeout(() => {

                isApplyingRemoteAction = false;

            }, 500);

        }

    }
);


// =====================================
// SYNC اولیه هنگام ورود
// =====================================

socket.on(
    "sync-request",
    () => {

        if (
            !roomId ||
            !video.src
        ) {
            return;
        }

        socket.emit(
            "sync-response",
            {
                roomId,
                time: video.currentTime,
                playing: !video.paused
            }
        );

    }
);


socket.on(
    "sync-response",
    async (data) => {

        if (
            !data ||
            !video.src ||
            !Number.isFinite(Number(data.time))
        ) {
            return;
        }

        isApplyingRemoteAction = true;

        try {

            ignoreNextSeeked = true;

            video.currentTime =
                Math.max(
                    0,
                    Number(data.time)
                );


            if (data.playing) {

                ignoreNextPlay = true;

                await video.play();

            }
            else {

                ignoreNextPause = true;

                video.pause();

            }

        }
        catch (error) {

            console.log(
                "Sync response error:",
                error
            );

        }
        finally {

            setTimeout(() => {

                isApplyingRemoteAction = false;

            }, 500);

        }

    }
);


// =====================================
// درخواست Sync بعد از ورود نفر جدید
// =====================================

socket.on(
    "room-users",
    (data) => {

        usersCountBadge.textContent =
            data.count;

        renderUsersPanel(
            data.users
        );


        if (data.count >= 2) {

            status.textContent =
                "هر دو نفر داخل اتاق هستید ❤️";


            // فقط کسی که از قبل داخل اتاق بوده
            // باید پاسخ Sync بدهد.
            //
            // سرور sync-request را برای نفرات دیگر
            // ارسال می‌کند، بنابراین اینجا فقط
            // درخواست را ارسال نمی‌کنیم.

        }
        else {

            status.textContent =
                "منتظر ورود پارتنر...";

            closeVoiceConnection();

        }

    }
);


// =====================================
// Progress UI
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
        (n) =>
            String(n).padStart(2, "0");

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
        video.currentTime /
        video.duration;

    const safeRatio =
        Math.min(
            1,
            Math.max(0, ratio)
        );

    progressBarFilled.style.width =
        `${safeRatio * 100}%`;

    progressBarHandle.style.left =
        `${safeRatio * 100}%`;

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
                Math.min(
                    1,
                    bufferedEnd /
                    video.duration
                );

            progressBarBuffered.style.width =
                `${ratio * 100}%`;

        }
        catch (error) {}

    }
);


// =====================================
// Progress Seek - Pointer Events
// =====================================

function seekFromClientX(clientX) {

    const rect =
        progressBarWrap.getBoundingClientRect();

    if (!rect.width) {
        return;
    }

    let ratio =
        (clientX - rect.left) /
        rect.width;

    ratio =
        Math.min(
            1,
            Math.max(0, ratio)
        );

    progressBarFilled.style.width =
        `${ratio * 100}%`;

    progressBarHandle.style.left =
        `${ratio * 100}%`;

    if (video.duration) {

        video.currentTime =
            ratio *
            video.duration;

    }

}


progressBarWrap.addEventListener(
    "pointerdown",
    (event) => {

        if (!video.src) {
            return;
        }

        event.preventDefault();

        isDraggingProgress = true;

        try {
            progressBarWrap.setPointerCapture(
                event.pointerId
            );
        }
        catch (error) {}

        seekFromClientX(
            event.clientX
        );

    }
);


progressBarWrap.addEventListener(
    "pointermove",
    (event) => {

        if (!isDraggingProgress) {
            return;
        }

        event.preventDefault();

        seekFromClientX(
            event.clientX
        );

    }
);


function finishProgressDrag() {

    if (!isDraggingProgress) {
        return;
    }

    isDraggingProgress = false;


    if (
        video.src &&
        roomId
    ) {

        // فقط یک seek در پایان Drag
        socket.emit(
            "video-action",
            {
                roomId,
                type: "seek",
                time: video.currentTime
            }
        );

    }

}


progressBarWrap.addEventListener(
    "pointerup",
    finishProgressDrag
);

progressBarWrap.addEventListener(
    "pointercancel",
    finishProgressDrag
);


// =====================================
// صدا
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
// Fullscreen
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

            if (
                playerWrapper.requestFullscreen
            ) {

                playerWrapper.requestFullscreen();

            }
            else if (
                playerWrapper.webkitRequestFullscreen
            ) {

                playerWrapper.webkitRequestFullscreen();

            }

        }
        else {

            if (document.exitFullscreen) {

                document.exitFullscreen();

            }
            else if (
                document.webkitExitFullscreen
            ) {

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
// کنترل‌های پلیر
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
        setTimeout(() => {

            if (!video.paused) {

                playerControls.classList.add(
                    "controls-hidden"
                );

            }

        }, 2600);

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
// Chat اصلی
// =====================================

function sendChatMessage() {

    sendChatFrom(
        chatInput
    );

}


sendChatBtn.addEventListener(
    "click",
    sendChatMessage
);


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


function addChatMessage(
    data,
    isMine
) {

    chatHistory.push({

        name:
            data.name,

        message:
            data.message,

        mine:
            isMine

    });


    renderMiniChat();


    if (chatEmpty) {
        chatEmpty.remove();
    }


    const messageElement =
        document.createElement("div");

    messageElement.className =
        isMine
            ? "chat-message mine"
            : "chat-message theirs";


    const nameElement =
        document.createElement("div");

    nameElement.className =
        "chat-message-name";

    nameElement.textContent =
        data.name;


    const textElement =
        document.createElement("div");

    textElement.className =
        "chat-message-text";

    textElement.textContent =
        data.message;


    const timeElement =
        document.createElement("div");

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

function showChatNotification(data) {

    const notification =
        document.createElement("div");

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

    requestAnimationFrame(() => {

        notification.classList.add(
            "show"
        );

    });

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

        setTimeout(() => {
            notification.remove();
        }, 400);

    }, 3500);

}


// =====================================
// جلوگیری از HTML Injection
// =====================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// =====================================
// صدای پیام
// =====================================

let messageAudioContext = null;


function playMessageSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }


        if (!messageAudioContext) {

            messageAudioContext =
                new AudioContext();

        }


        if (
            messageAudioContext.state ===
            "suspended"
        ) {

            messageAudioContext.resume()
                .catch(() => {});

        }


        const oscillator =
            messageAudioContext.createOscillator();

        const gain =
            messageAudioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.setValueAtTime(
            700,
            messageAudioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            1000,
            messageAudioContext.currentTime + 0.08
        );


        gain.gain.setValueAtTime(
            0.0001,
            messageAudioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.12,
            messageAudioContext.currentTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            messageAudioContext.currentTime + 0.18
        );


        oscillator.connect(gain);

        gain.connect(
            messageAudioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            messageAudioContext.currentTime + 0.18
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

        const willOpen =
            emojiPanel.classList.contains(
                "hidden"
            );

        closeAllPopupsExcept(
            willOpen
                ? "emoji"
                : null
        );

        emojiPanel.classList.toggle(
            "hidden",
            !willOpen
        );

    }
);


// =====================================
// بستن Popup ها با کلیک بیرون
// =====================================

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


        if (
            !subtitleSettingsPanel.contains(event.target) &&
            event.target !== subtitleSettingsBtn
        ) {

            subtitleSettingsPanel.classList.add(
                "hidden"
            );

        }


        if (
            !miniChatPanel.contains(event.target) &&
            event.target !== chatToggleBtn
        ) {

            miniChatPanel.classList.add(
                "hidden"
            );

        }


        if (
            !emojiPanel.contains(event.target) &&
            event.target !== emojiBtn
        ) {

            emojiPanel.classList.add(
                "hidden"
            );

        }


        if (
            !usersPanel.contains(event.target) &&
            event.target !== usersToggleBtn
        ) {

            usersPanel.classList.add(
                "hidden"
            );

        }

    }
);