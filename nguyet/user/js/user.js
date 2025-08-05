// /user/js/user.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (Thêm các element mới) ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const userNameInput = document.getElementById('user-name');
    const quizSetListContainer = document.getElementById('quiz-set-list'); // Mới
    const startBtn = document.getElementById('start-btn');

    const welcomeUser = document.getElementById('welcome-user');
    const quizSetTitle = document.getElementById('quiz-set-title'); // Mới
    const timerSpan = document.getElementById('timer');
    const quizForm = document.getElementById('quiz-form'); // Đổi: không cần questionsContainer nữa, form sẽ chứa tất cả

    const scoreSpan = document.getElementById('score');
    const timeTakenSpan = document.getElementById('time-taken');
    const reviewContainer = document.getElementById('review-container');
    const retryBtn = document.getElementById('retry-btn');

    // --- State variables (Thêm/Sửa) ---
    let userName = '';
    let currentQuizQuestions = []; // Chỉ cần biến này, không cần allQuestions
    let selectedQuizSet = null;    // Mới: Lưu bộ đề được chọn
    let timerInterval;
    let secondsElapsed = 0;

    // --- Core Functions (Giữ nguyên) ---
    const showScreen = (screen) => {
        startScreen.style.display = 'none';
        quizScreen.style.display = 'none';
        resultScreen.style.display = 'none';
        if (screen) screen.style.display = 'block';
    };

    const startTimer = () => {
        secondsElapsed = 0;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            const minutes = Math.floor(secondsElapsed / 60);
            const seconds = secondsElapsed % 60;
            timerSpan.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    };

    const retryQuiz = () => window.location.reload();

    const renderQuiz = () => {
        // Đổi: quizForm sẽ chứa tất cả
        quizForm.innerHTML = ''; 
        
        currentQuizQuestions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            questionBlock.setAttribute('data-id', q.id);
            questionBlock.setAttribute('data-type', q.type);

            let questionContentHTML = `<p><strong>Câu ${index + 1}:</strong> ${q.text}</p>`;

            switch (q.type) {
                case 'multiple-choice':
                    const sortedOptions = Object.keys(q.options).sort();
                    const optionsHTML = sortedOptions.map(key => `
                        <label>
                            <input type="radio" name="question-${q.id}" value="${key}" required>
                            ${key}: ${q.options[key]}
                        </label>
                    `).join('');
                    questionContentHTML += `<div class="options">${optionsHTML}</div>`;
                    break;
                case 'matching':
                    const prompts = q.pairs.map(p => p.prompt);
                    const answers = [...q.pairs.map(p => p.answer)].sort(() => Math.random() - 0.5);
                    let matchingHTML = '<div class="matching-container" style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center;">';
                    prompts.forEach((prompt, i) => {
                        const selectOptions = answers.map(ans => `<option value="${ans}">${ans}</option>`).join('');
                        matchingHTML += `
                            <span class="matching-prompt">${prompt}</span>
                            <span>↔️</span>
                            <select name="question-${q.id}-${i}" class="form-control" required>
                                <option value="">-- Chọn đáp án --</option>
                                ${selectOptions}
                            </select>
                        `;
                    });
                    matchingHTML += '</div>';
                    questionContentHTML += matchingHTML;
                    break;
                case 'essay':
                    questionContentHTML += `
                        <textarea name="question-${q.id}" class="form-control" rows="5" placeholder="Nhập câu trả lời của bạn..." required></textarea>
                    `;
                    break;
            }
            questionBlock.innerHTML = questionContentHTML;
            quizForm.appendChild(questionBlock);
        });

        // Thêm nút Nộp bài vào cuối form
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-success';
        submitButton.textContent = 'Nộp bài';
        quizForm.appendChild(submitButton);
    };

    const submitQuiz = async (e) => {
        e.preventDefault();
        if (!confirm('Bạn có chắc chắn muốn nộp bài không?')) return;
        clearInterval(timerInterval);

        let autoGradedScore = 0;
        let maxAutoGradedScore = 0;
        let hasEssay = false;
        const userAnswers = [];

        currentQuizQuestions.forEach((q, index) => {
            let answerDetail = {
                questionId: q.id,
                questionType: q.type,
                questionText: q.text
            };
            switch (q.type) {
                case 'multiple-choice':
                    maxAutoGradedScore++;
                    const selectedRadio = quizForm.querySelector(`input[name="question-${q.id}"]:checked`);
                    const userAnswerMC = selectedRadio ? selectedRadio.value : null;
                    answerDetail.userAnswer = userAnswerMC;
                    answerDetail.correctAnswer = q.correct;
                    answerDetail.options = q.options;
                    if (userAnswerMC === q.correct) autoGradedScore++;
                    break;
                case 'matching':
                    maxAutoGradedScore++;
                    const userMatching = {};
                    const correctMatching = {};
                    let isAllCorrect = true;
                    q.pairs.forEach((pair, i) => {
                        const select = quizForm.querySelector(`select[name="question-${q.id}-${i}"]`);
                        const selectedAnswer = select.value;
                        userMatching[pair.prompt] = selectedAnswer;
                        correctMatching[pair.prompt] = pair.answer;
                        if (selectedAnswer !== pair.answer) isAllCorrect = false;
                    });
                    answerDetail.userAnswer = userMatching;
                    answerDetail.correctAnswer = correctMatching;
                    if (isAllCorrect) autoGradedScore++;
                    break;
                case 'essay':
                    const essayText = quizForm.querySelector(`textarea[name="question-${q.id}"]`).value;
                    answerDetail.userAnswer = essayText;
                    answerDetail.maxPoints = q.maxPoints;
                    answerDetail.gradedPoints = null;
                    hasEssay = true;
                    break;
            }
            userAnswers.push(answerDetail);
        });

        try {
            await db.collection('results').add({
                name: userName,
                quizSetId: selectedQuizSet.id, // Mới: Lưu ID bộ đề
                quizSetName: selectedQuizSet.name, // Mới: Lưu tên bộ đề
                autoGradedScore: autoGradedScore,
                maxAutoGradedScore: maxAutoGradedScore,
                finalScore: null,
                timeTaken: secondsElapsed,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                answers: userAnswers,
                status: hasEssay ? 'pending_grading' : 'graded'
            });
            displayResults(autoGradedScore, maxAutoGradedScore, hasEssay);
        } catch (error) {
            console.error("Lỗi khi lưu kết quả:", error);
            alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
        }
    };

    const displayResults = (score, maxScore, hasEssay) => {
        // Tạo màn hình kết quả động bằng JS
        resultScreen.innerHTML = `
            <h2>Kết quả bài làm</h2>
            <p><strong>Điểm phần tự động chấm:</strong> <span id="score">${score}/${maxScore}</span></p>
            <p><strong>Tổng thời gian làm bài:</strong> <span id="time-taken">${Math.floor(secondsElapsed / 60)} phút ${secondsElapsed % 60} giây</span></p>
            ${hasEssay ? '<p><em>Phần tự luận của bạn đang chờ chấm điểm. Vui lòng kiểm tra lại sau.</em></p>' : ''}
            <hr>
            <h3>Xem lại đáp án</h3>
            <div id="review-container">Cảm ơn bạn đã hoàn thành bài thi!</div>
            <button id="retry-btn-dynamic" class="btn btn-primary">Làm lại bài khác</button>
        `;
        resultScreen.querySelector('#retry-btn-dynamic').addEventListener('click', retryQuiz);
        showScreen(resultScreen);
    };

    // --- NEW LOGIC (Thay thế cho initializeApp cũ) ---

    // 1. Render danh sách các bộ đề
    const renderQuizSetList = (sets) => {
        quizSetListContainer.innerHTML = '';
        if (sets.length === 0) {
            quizSetListContainer.innerHTML = '<p>Hiện chưa có bộ đề nào để làm.</p>';
            return;
        }
        sets.forEach(set => {
            const card = document.createElement('div');
            card.className = 'quiz-set-card';
            card.dataset.setId = set.id;
            card.innerHTML = `
                <h4>${set.name} (${set.questionIds.length} câu)</h4>
                <p>${set.description || 'Không có mô tả'}</p>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.quiz-set-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedQuizSet = set; // Lưu lại toàn bộ thông tin bộ đề được chọn
                startBtn.disabled = false;
            });
            quizSetListContainer.appendChild(card);
        });
    };
    
    // 2. Lấy danh sách bộ đề từ Firebase
    const fetchQuizSets = async () => {
        try {
            const snapshot = await db.collection('quiz_sets').orderBy('createdAt', 'desc').get();
            const sets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderQuizSetList(sets);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bộ đề:", error);
            quizSetListContainer.innerHTML = '<p>Đã xảy ra lỗi khi tải danh sách bộ đề. Vui lòng làm mới trang.</p>';
        }
    };

    // 3. Hàm bắt đầu bài thi đã được cập nhật
    const startQuiz = async () => {
        userName = userNameInput.value.trim();
        if (!userName) {
            alert('Vui lòng nhập tên của bạn.');
            return;
        }
        if (!selectedQuizSet) {
            alert('Vui lòng chọn một bộ đề.');
            return;
        }

        try {
            // Lấy chính xác các câu hỏi dựa trên mảng IDs của bộ đề
            const questionPromises = selectedQuizSet.questionIds.map(id => db.collection('questions').doc(id).get());
            const questionDocs = await Promise.all(questionPromises);
            
            currentQuizQuestions = questionDocs
                .filter(doc => doc.exists) // Lọc bỏ những câu hỏi có thể đã bị admin xóa
                .map(doc => ({ id: doc.id, ...doc.data() }));

            if (currentQuizQuestions.length === 0) {
                alert('Bộ đề này không có câu hỏi hợp lệ hoặc đã bị xóa. Vui lòng chọn bộ đề khác.');
                return;
            }

            // Chuẩn bị màn hình làm bài
            welcomeUser.textContent = `Bài làm của ${userName}`;
            quizSetTitle.textContent = selectedQuizSet.name;
            
            // Bắt đầu
            renderQuiz();
            startTimer();
            showScreen(quizScreen);

        } catch (error) {
            console.error("Lỗi khi bắt đầu bài thi:", error);
            alert('Đã có lỗi xảy ra khi tải câu hỏi cho bộ đề này.');
        }
    };
    
    // --- Event Listeners & Initialization ---
    startBtn.addEventListener('click', startQuiz);
    quizForm.addEventListener('submit', submitQuiz);
    // Nút retry đã được thêm động nên không cần listener ở đây nữa
    
    // Hàm khởi tạo chính của ứng dụng
    const initializeUserApp = () => {
        showScreen(startScreen);
        fetchQuizSets(); // Bắt đầu bằng việc tải danh sách bộ đề
    };

    initializeUserApp(); // Chạy ứng dụng
});