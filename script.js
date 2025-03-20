let voices = [];
let isSpeaking = false;

// Tạo options cho <select> khi trang load
document.addEventListener("DOMContentLoaded", function() {
    const lessonSelect = document.getElementById("lessonSelect");
    for (const lessonKey in lessons) {
        const option = document.createElement("option");
        option.value = lessonKey;
        option.textContent = lessons[lessonKey].title;
        lessonSelect.appendChild(option);
    }
});

function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
        };
    }
}
loadVoices();

// Hiển thị giá trị slider
const speechRateSlider = document.getElementById("speechRate");
const delaySlider = document.getElementById("delay");
const speechRateValue = document.getElementById("speechRateValue");
const delayValue = document.getElementById("delayValue");

speechRateSlider.addEventListener("input", function() {
    speechRateValue.textContent = this.value;
});
delaySlider.addEventListener("input", function() {
    delayValue.textContent = this.value;
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

function processAndSpeakList() {
    if (isSpeaking) return;
    isSpeaking = true;

    const playBtn = document.getElementById("playBtn");
    playBtn.disabled = true;

    const input = document.getElementById("inputWords").value;
    const lines = input.split("\n").filter(line => line.trim() !== "");
    if (lines.length === 0) {
        alert("Vui lòng nhập ít nhất một từ hoặc chọn bài học!");
        isSpeaking = false;
        playBtn.disabled = false;
        return;
    }

    let index = 0;
    const rate = parseFloat(document.getElementById("speechRate").value);
    const delay = parseFloat(document.getElementById("delay").value) * 1000;
    const playVietnamese = document.getElementById("playVietnamese").checked;

    function speakNext() {
        if (!isSpeaking) return;

        if (index >= lines.length) {
            index = 0;
        }

        const progress = (index + 1) * (100 / lines.length);
        document.querySelector(".progress").style.width = `${progress}%`;

        const parts = lines[index].split(" - ");
        if (parts.length < 3) {
            alert(`Dòng ${index + 1} sai định dạng, cần: pinyin - chữ Hán - nghĩa`);
            isSpeaking = false;
            playBtn.disabled = false;
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

        if (playVietnamese) {
            chineseUtterance.onend = () => {
                vietnameseUtterance.onend = () => {
                    index++;
                    setTimeout(speakNext, delay);
                };
                window.speechSynthesis.speak(vietnameseUtterance);
            };
        } else {
            chineseUtterance.onend = () => {
                index++;
                setTimeout(speakNext, delay);
            };
        }

        window.speechSynthesis.speak(chineseUtterance);
    }

    speakNext();
}

function stopSpeaking() {
    isSpeaking = false;
    window.speechSynthesis.cancel();
    document.getElementById("currentWord").innerHTML = "";
    document.querySelector(".progress").style.width = "0%";
    document.getElementById("playBtn").disabled = false;
}