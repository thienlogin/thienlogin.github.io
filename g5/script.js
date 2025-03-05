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
  
  let currentTeam = null;
  let currentNumber = null;
  
  function selectTeam(team) {
      currentTeam = team;
      document.getElementById("title").style.display = "none";
      document.getElementById("subtitle").style.display = "none";
      document.getElementById("team-selection").style.display = "none";
      document.getElementById("word-selection").style.display = "block";
      document.getElementById("team-name").innerText = `Team ${team}`;
      document.getElementById("numbers").style.display = "block";
      document.getElementById("word-display").style.display = "none";
      document.getElementById("back-to-teams").style.display = "block";
  }
  
  function showWord(number) {
      currentNumber = number;
      document.getElementById("numbers").style.display = "none";
      document.getElementById("word-display").style.display = "block";
  
      db.ref("round").on("value", (roundSnapshot) => {
          const round = roundSnapshot.val();
          if (round === 0) {
              document.getElementById("word").innerText = "Chuẩn bị...";
          } else {
              db.ref(`teams/${currentTeam}/${currentNumber}`).once("value", (wordSnapshot) => {
                  const word = wordSnapshot.val() || "Chuẩn bị...";
                  document.getElementById("word").innerText = word;
              });
          }
      });
  }
  
  function backToNumbers() {
      document.getElementById("word-display").style.display = "none";
      document.getElementById("numbers").style.display = "block";
  }
  
  function backToTeams() {
      document.getElementById("word-selection").style.display = "none";
      document.getElementById("team-selection").style.display = "flex";
      document.getElementById("title").style.display = "block";
      document.getElementById("subtitle").style.display = "block";
      document.getElementById("back-to-teams").style.display = "none";
      document.getElementById("numbers").style.display = "block";
      document.getElementById("word-display").style.display = "none";
  }
