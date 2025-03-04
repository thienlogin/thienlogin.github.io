const greetings = {
  1: [ 'Thông', 'Minh', 'Cù', 'Cần', 'Bù' ],
  2: [ 'Cả', 'Mất', 'Lẫn', 'Chài', 'Chì' ],
  3: [ 'Chân', 'Miệng', 'Đỡ', 'Tay', 'Mồm' ],
  4: [ 'Con', 'Đói', 'No', 'Mắt', 'Bụng' ],
  5: [ 'Nước', 'Chậm', 'Đục', 'Trâu', 'Uống' ],
  6: [ 'Chạy', 'Nắng', 'Trời', 'Khỏi', 'Không' ],
  7: [ 'Cổ', 'Ra', 'Vắt', 'Nước', 'Chày' ],
  8: [ 'Vẽ', 'Cho', 'Hươu', 'Chạy', 'Đường' ],
  9: [ 'Cắn', 'Gà', 'Rắn', 'Nhà', 'Cõng' ],
  10: [ 'Thêm', 'Lửa', 'Đổ', 'Vào', 'Dầu' ]
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
