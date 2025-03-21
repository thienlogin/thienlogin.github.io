let voices = [];
let isSpeaking = false;
let isPaused = false;
let lessons = {};
let currentUtterance = null;
let currentIndex = 0;
let lines = [];
let rate = 1;
let delay = 1000;
let timeoutId = null;

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD3XzQuT0mm0VuiIlRjh4J_8NspqRnup3c",
    authDomain: "hoc-tieng-trung-8fcb7.firebaseapp.com",
    databaseURL: "https://hoc-tieng-trung-8fcb7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hoc-tieng-trung-8fcb7",
    storageBucket: "hoc-tieng-trung-8fcb7.firebasestorage.app",
    messagingSenderId: "241542260275",
    appId: "1:241542260275:web:14ac29e9b1c368fabb6546",
    measurementId: "G-9XD0EK9N9V"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Load bài học từ Firebase
async function loadLessons() {
    try {
        const snapshot = await database.ref('lessons').once('value');
        lessons = snapshot.val();

        const lessonSelect = document.getElementById("lessonSelect");
        for (const lessonKey in lessons) {
            const option = document.createElement("option");
            option.value = lessonKey;
            option.textContent = lessons[lessonKey].title;
            lessonSelect.appendChild(option);
        }
    } catch (error) {
        console.error("Lỗi khi load lessons từ Firebase:", error);
        alert("Không thể tải danh sách bài học.");
    }
}

// Gọi hàm loadLessons khi trang load
document.addEventListener("DOMContentLoaded", loadLessons);

function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
        };
    }
}
loadVoices();

// Hiển thị giá trị slider và cập nhật theo thời gian thực
const speechRateSlider = document.getElementById("speechRate");
const delaySlider = document.getElementById("delay");
const speechRateValue = document.getElementById("speechRateValue");
const delayValue = document.getElementById("delayValue");

speechRateSlider.addEventListener("input", function() {
    speechRateValue.textContent = this.value;
    rate = parseFloat(this.value);
    if (isSpeaking && !isPaused) {
        window.speechSynthesis.cancel();
        clearTimeout(timeoutId);
        speakNext(); // Đọc lại câu hiện tại với tốc độ mới
    }
});

delaySlider.addEventListener("input", function() {
    delayValue.textContent = this.value;
    delay = parseFloat(this.value) * 1000;
    if (isSpeaking && !isPaused) {
        window.speechSynthesis.cancel(); // Hủy phát âm hiện tại
        clearTimeout(timeoutId); // Hủy timeout hiện tại
        speakNext(); // Đọc lại câu hiện tại với khoảng cách mới
    }
});

// Xử lý khi chọn bài học
document.getElementById("lessonSelect").addEventListener("change", function() {
    const selectedLesson = this.value;
    if (selectedLesson && lessons[selectedLesson]) {
        document.getElementById("inputWords").value = lessons[selectedLesson].words.join("\n");
    } else {
        document.getElementById("inputWords").value = "";
    }
});

// Xử lý nút play/pause
const playPauseBtn = document.getElementById("playPauseBtn");
playPauseBtn.addEventListener("click", togglePlayPause);

// Xử lý nút replay
document.getElementById("replayBtn").addEventListener("click", replay);

// Xử lý nút next
document.getElementById("nextBtn").addEventListener("click", skipToNext);

function togglePlayPause() {
    if (!isSpeaking) {
        startSpeaking();
    } else if (isPaused) {
        resumeSpeaking();
    } else {
        pauseSpeaking();
    }
}

function startSpeaking() {
    if (isSpeaking) return;
    isSpeaking = true;
    isPaused = false;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

    const input = document.getElementById("inputWords").value;
    lines = input.split("\n").filter(line => line.trim() !== "");
    if (lines.length === 0) {
        alert("Vui lòng nhập ít nhất một từ hoặc chọn bài học!");
        stopSpeaking();
        return;
    }

    currentIndex = 0;
    rate = parseFloat(document.getElementById("speechRate").value);
    delay = parseFloat(document.getElementById("delay").value) * 1000;
    speakNext();
}

function resumeSpeaking() {
    isPaused = false;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    window.speechSynthesis.cancel(); // Hủy phát âm hiện tại
    speakNext(); // Đọc lại từ đầu câu hiện tại
}

function pauseSpeaking() {
    isPaused = true;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    window.speechSynthesis.cancel(); // Hủy phát âm hiện tại
    clearTimeout(timeoutId);
}

function stopSpeaking() {
    isSpeaking = false;
    isPaused = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    window.speechSynthesis.cancel();
    clearTimeout(timeoutId);
    document.getElementById("currentWord").innerHTML = "";
    document.querySelector(".progress").style.width = "0%";
}

function replay() {
    stopSpeaking();
    startSpeaking();
}

function skipToNext() {
    if (!isSpeaking) return;
    window.speechSynthesis.cancel();
    clearTimeout(timeoutId);
    currentIndex++;
    if (currentIndex >= lines.length) {
        stopSpeaking();
        return;
    }
    speakNext();
}

function speakNext() {
    if (!isSpeaking || isPaused) return;

    if (currentIndex >= lines.length) {
        currentIndex = 0; // Reset về đầu danh sách
        document.querySelector(".progress").style.width = "0%"; // Reset thanh tiến trình
        speakNext(); // Gọi lại để đọc từ đầu
        return;
    }

    const progress = (currentIndex + 1) * (100 / lines.length);
    document.querySelector(".progress").style.width = `${progress}%`;

    // Chuẩn hóa chuỗi: thêm khoảng cách trước/sau dấu - nếu thiếu
    let line = lines[currentIndex].trim();
    line = line.replace(/-+/g, ' - ').replace(/\s+/g, ' ').trim(); // Thay thế các dấu - không có khoảng cách bằng " - ", và chuẩn hóa khoảng trắng

    const parts = line.split(" - ");
    if (parts.length < 3) {
        alert(`Dòng ${currentIndex + 1} sai định dạng, cần: pinyin - chữ Hán - nghĩa`);
        stopSpeaking();
        return;
    }

    const pinyin = parts[0];
    const hanzi = parts[1];
    const meaning = parts[2];

    document.getElementById("currentWord").innerHTML = `
        <div class="pinyin">${pinyin}</div>
        <div class="hanzi">${hanzi}</div>
        <div class="meaning">${meaning}</div>
    `;

    const chineseVoice = voices.find(voice => 
        voice.lang === 'zh-CN' && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang === 'zh-CN');

    const chineseUtterance = new SpeechSynthesisUtterance(hanzi);
    chineseUtterance.lang = 'zh-CN';
    chineseUtterance.rate = rate;
    if (chineseVoice) chineseUtterance.voice = chineseVoice;

    const vietnameseUtterance = new SpeechSynthesisUtterance(meaning);
    vietnameseUtterance.lang = 'vi-VN';
    vietnameseUtterance.rate = rate;
    vietnameseUtterance.volume = 0.7;

    const playVietnamese = document.getElementById("playVietnamese").checked;
    const playTwiceChinese = document.getElementById("playTwiceChinese").checked;

    if (playTwiceChinese) {
        // Đọc lần 1 tiếng Trung
        chineseUtterance.onend = () => {
            // Đọc lần 2 tiếng Trung
            const secondChineseUtterance = new SpeechSynthesisUtterance(hanzi);
            secondChineseUtterance.lang = 'zh-CN';
            secondChineseUtterance.rate = rate;
            if (chineseVoice) secondChineseUtterance.voice = chineseVoice;

            if (playVietnamese) {
                secondChineseUtterance.onend = () => {
                    vietnameseUtterance.onend = () => {
                        currentIndex++;
                        timeoutId = setTimeout(speakNext, delay);
                    };
                    window.speechSynthesis.speak(vietnameseUtterance);
                };
            } else {
                secondChineseUtterance.onend = () => {
                    currentIndex++;
                    timeoutId = setTimeout(speakNext, delay);
                };
            }
            window.speechSynthesis.speak(secondChineseUtterance);
        };
    } else {
        // Chỉ đọc 1 lần tiếng Trung
        if (playVietnamese) {
            chineseUtterance.onend = () => {
                vietnameseUtterance.onend = () => {
                    currentIndex++;
                    timeoutId = setTimeout(speakNext, delay);
                };
                window.speechSynthesis.speak(vietnameseUtterance);
            };
        } else {
            chineseUtterance.onend = () => {
                currentIndex++;
                timeoutId = setTimeout(speakNext, delay);
            };
        }
    }

    window.speechSynthesis.speak(chineseUtterance);
}