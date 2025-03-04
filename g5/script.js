const greetings = {
    1: ["Chúc", "Mừng", "8/3", "Vui", "Vẻ"],
    2: ["Phụ", "Nữ", "Tự", "Tin", "Vui"],
    3: ["8/3", "Rực", "Rỡ", "Hạnh", "Phúc"],
    4: ["Chị", "Em", "Tuyệt", "Vời", "Nhất"],
    5: ["Ngày", "8/3", "Hạnh", "Phúc", "Vui"],
    6: ["Mừng", "8/3", "Chị", "Em", "Xinh"],
    7: ["Phụ", "Nữ", "Công", "Sở", "Giỏi"],
    8: ["8/3", "Niềm", "Vui", "Trọn", "Vẹn"],
    9: ["Chúc", "Chị", "Em", "Luôn", "Rạng"],
    10: ["Ngày", "8/3", "Yêu", "Thương", "Nhiều"]
};

let currentTeam = null;

function selectTeam(team) {
    currentTeam = team;
    document.getElementById("title").style.display = "none";
    document.getElementById("team-selection").style.display = "none";
    document.getElementById("word-selection").style.display = "block";
    document.getElementById("team-name").innerText = `Team ${team}`;
    document.getElementById("numbers").style.display = "block";
    document.getElementById("word-display").style.display = "none";
    document.getElementById("back-to-teams").style.display = "block";
}

function showWord(number) {
    const word = greetings[currentTeam][number - 1];
    document.getElementById("numbers").style.display = "none";
    document.getElementById("word-display").style.display = "block";
    document.getElementById("word").innerText = word;
}

function backToNumbers() {
    document.getElementById("word-display").style.display = "none";
    document.getElementById("numbers").style.display = "block";
}

function backToTeams() {
    document.getElementById("word-selection").style.display = "none";
    document.getElementById("team-selection").style.display = "flex"; // Đảm bảo flex khi back
    document.getElementById("title").style.display = "block";
    document.getElementById("back-to-teams").style.display = "none";
    document.getElementById("numbers").style.display = "block";
    document.getElementById("word-display").style.display = "none";
}