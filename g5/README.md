<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chuỗi Chúc Mừng 8/3</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Chuỗi Chúc Mừng 8/3</h1>
        <div id="team-selection">
            <button onclick="selectTeam(1)">Team 1</button>
            <button onclick="selectTeam(2)">Team 2</button>
            <button onclick="selectTeam(3)">Team 3</button>
            <button onclick="selectTeam(4)">Team 4</button>
            <button onclick="selectTeam(5)">Team 5</button>
        </div>
        <div id="word-selection" style="display: none;">
            <h2 id="team-name"></h2>
            <div id="numbers">
                <button onclick="showWord(1)">1</button>
                <button onclick="showWord(2)">2</button>
                <button onclick="showWord(3)">3</button>
                <button onclick="showWord(4)">4</button>
                <button onclick="showWord(5)">5</button>
            </div>
            <div id="word-display" style="display: none;">
                <h3 id="word"></h3>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>