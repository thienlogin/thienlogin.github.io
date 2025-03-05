const firebaseConfig = {
    apiKey: "AIzaSyADQMdT25H9hWJYT1DDP9TNRXFPo5RrnD8",
    authDomain: "g5game-de6f5.firebaseapp.com",
    databaseURL: "https://g5game-de6f5-default-rtdb.firebaseio.com",
    projectId: "g5game-de6f5",
    storageBucket: "g5game-de6f5.firebasestorage.app",
    messagingSenderId: "135303161681",
    appId: "1:135303161681:web:3f41c8ef824c0291761570",
    measurementId: "G-088FGVKS5K"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Danh sách từ cho Round 1 (giữ nguyên thứ tự)
const greetings1 = {
    1: ["Thông", "Minh", "Cù", "Cần", "Bù"],
    2: ["Cả", "Mất", "Lẫn", "Chài", "Chì"],
    3: ["Chân", "Miệng", "Đỡ", "Tay", "Mồm"],
    4: ["Con", "Đói", "No", "Mắt", "Bụng"],
    5: ["Nước", "Chậm", "Đục", "Trâu", "Uống"],
    6: ["Chạy", "Nắng", "Trời", "Khỏi", "Không"],
    7: ["Cổ", "Ra", "Vắt", "Nước", "Chày"],
    8: ["Vẽ", "Cho", "Hươu", "Chạy", "Đường"],
    9: ["Cắn", "Gà", "Rắn", "Nhà", "Cõng"],
    10: ["Thêm", "Lửa", "Đổ", "Vào", "Dầu"]
};

// Danh sách từ cho Round 2 (đảo lộn cố định)
const greetings2 = {
    1: ["Vung", "Nồi", "Úp", "Nào", "Nấy"],        // Nồi Nào Úp Vung Nấy
    2: ["Thua", "Vua", "Lệ", "Phép", "Làng"],     // Phép Vua Thua Lệ Làng
    3: ["Nan", "Sự", "Đầu", "Vạn", "Khởi"],       // Vạn Sự Khởi Đầu Nan
    4: ["Nhảy", "Chân", "Mới", "Nước", "Đến"],    // Nước Đến Chân Mới Nhảy
    5: ["Rán", "Mù", "Cá", "Mèo", "Vớ"],         // Mèo Mù Vớ Cá Rán
    6: ["Tổ", "Lâu", "Đầy", "Kiến", "Tha"],       // Kiến Tha Lâu Đầy Tổ
    7: ["Ông", "Đập", "Gậy", "Lưng", "Ông"],      // Gậy Ông Đập Lưng Ông
    8: ["Tử", "Phụ", "Hổ", "Sinh", "Hổ"],         // Hổ Phụ Sinh Hổ Tử
    9: ["Ăn", "Ghét", "Trâu", "Buộc", "Trâu"],    // Trâu Buộc Ghét Trâu Ăn
    10: ["Lợi", "Công", "Hưởng", "Vô", "Bất"]     // Vô Công Bất Hưởng Lợi
};

let round = 0;

// Hàm chung để gửi từ cho từng round
function sendWords(currentGreetings, roundNumber) {
    // Reset tất cả từ về rỗng trước khi gửi từ mới
    for (let team = 1; team <= 10; team++) {
        for (let num = 1; num <= 5; num++) {
            db.ref(`teams/${team}/${num}`).set("");
        }
    }

    // Gửi từ mới cho từng team
    setTimeout(() => {
        for (let team = 1; team <= 10; team++) {
            const words = currentGreetings[team];
            for (let num = 1; num <= 5; num++) {
                db.ref(`teams/${team}/${num}`).set(words[num - 1]);
            }
        }
        db.ref("round").set(roundNumber);
    }, 500);
}

function startRound() {
    round++;
    document.getElementById("round-status").innerText = `Đã chạy Round ${round}`;

    // Chọn danh sách từ dựa trên round
    let currentGreetings = (round === 1) ? greetings1 : greetings2;

    // Nếu vượt quá Round 2, thông báo
    if (round > 2) {
        document.getElementById("round-status").innerText = "Đã hết danh sách Round!";
        round = 2;
        return;
    }

    sendWords(currentGreetings, round);
}

function startRound1() {
    round = 1;
    document.getElementById("round-status").innerText = "Đã chạy Round 1";
    sendWords(greetings1, 1);
}

function startRound2() {
    round = 2;
    document.getElementById("round-status").innerText = "Đã chạy Round 2";
    sendWords(greetings2, 2);
}

function stopRound() {
    round = 0;
    document.getElementById("round-status").innerText = "Đã dừng, Round reset về 0";

    // Xóa hết từ và reset round về 0
    for (let team = 1; team <= 10; team++) {
        for (let num = 1; num <= 5; num++) {
            db.ref(`teams/${team}/${num}`).set("");
        }
    }
    db.ref("round").set(0);
}

// Reset round về 0 khi tải trang admin
db.ref("round").set(0);
