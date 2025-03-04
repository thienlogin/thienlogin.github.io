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
  
  const greetings = {
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
  
  let round = 0;
  
  function startRound() {
      round++;
      document.getElementById("round-status").innerText = `Đã chạy Round ${round}`;
  
      // Reset tất cả từ về rỗng trước khi gửi từ mới
      for (let team = 1; team <= 10; team++) {
          for (let num = 1; num <= 5; num++) {
              db.ref(`teams/${team}/${num}`).set("");
          }
      }
  
      // Gửi từ mới cho từng team
      setTimeout(() => {
          for (let team = 1; team <= 10; team++) {
              const words = greetings[team];
              for (let num = 1; num <= 5; num++) {
                  db.ref(`teams/${team}/${num}`).set(words[num - 1]);
              }
          }
          db.ref("round").set(round);
      }, 500);
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