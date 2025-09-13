// /admin/js/results.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const resultsList = document.getElementById('results-list');
    const modal = document.getElementById('result-detail-modal');
    const modalTitle = document.getElementById('result-detail-title');
    const modalContent = document.getElementById('result-detail-content');
    const closeModalBtn = modal.querySelector('.close-btn');

    let currentDeletingDocId = null;

    // --- General Functions ---
    const closeModal = () => {
        modal.style.display = 'none';
        currentDeletingDocId = null;
    };
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
    });

    const deleteResult = (docId) => {
        if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN kết quả này không?')) return;
        db.collection('results').doc(docId).delete()
            .then(() => {
                console.log("Xóa kết quả thành công!");
                closeModal();
            })
            .catch(error => {
                console.error("Lỗi khi xóa kết quả: ", error);
                alert("Đã xảy ra lỗi khi xóa.");
            });
    };

    const formatTime = (totalSeconds) => {
        if (typeof totalSeconds !== 'number') return 'N/A';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // --- Grading Logic ---
    const saveGrades = async (docId, resultData) => {
        let totalEssayPoints = 0;
        const updatedAnswers = [...resultData.answers];
        let isValid = true;

        modal.querySelectorAll('.essay-score-input').forEach(input => {
            const index = parseInt(input.getAttribute('data-answer-index'));
            const points = parseFloat(input.value);
            const maxPoints = updatedAnswers[index].maxPoints;

            if (isNaN(points) || points < 0 || points > maxPoints) {
                alert(`Điểm cho câu ${index + 1} không hợp lệ! Phải là số từ 0 đến ${maxPoints}.`);
                isValid = false;
            } else {
                updatedAnswers[index].gradedPoints = points;
                totalEssayPoints += points;
            }
        });

        if (isValid) {
            const newFinalScore = resultData.autoGradedScore + totalEssayPoints;
            try {
                await db.collection('results').doc(docId).update({
                    answers: updatedAnswers,
                    finalScore: newFinalScore,
                    status: 'graded'
                });
                alert("Lưu điểm thành công!");
                closeModal();
            } catch (error) {
                console.error("Lỗi khi lưu điểm: ", error);
                alert("Đã có lỗi xảy ra khi lưu điểm.");
            }
        }
    };
    
    // --- Rendering Logic ---
    const renderResultDetail = (docId, resultData) => {
        currentDeletingDocId = docId;
        modalTitle.textContent = `Chi tiết bài làm của ${resultData.name}`;
        
        let detailHTML = '';
        resultData.answers.forEach((answer, index) => {
            detailHTML += `<div class="review-item">`;
            detailHTML += `<p><strong>Câu ${index + 1} (${answer.questionType}):</strong> ${answer.questionText}</p>`;
            
            switch (answer.questionType) {
                case 'multiple-choice':
                    const isCorrectMC = answer.userAnswer === answer.correctAnswer;
                    detailHTML += `<div class="${isCorrectMC ? 'correct' : 'incorrect'}">
                                      <div><strong>Bạn chọn:</strong> ${answer.options[answer.userAnswer] || 'Chưa trả lời'} (${answer.userAnswer})</div>
                                      ${!isCorrectMC ? `<div><strong>Đáp án đúng:</strong> ${answer.options[answer.correctAnswer]} (${answer.correctAnswer})</div>` : ''}
                                   </div>`;
                    break;
                case 'matching':
                    let matchingReview = '<ul>';
                    let isAllCorrect = true;
                    for (const prompt in answer.correctAnswer) {
                        const userAns = answer.userAnswer[prompt];
                        const correctAns = answer.correctAnswer[prompt];
                        const isPairCorrect = userAns === correctAns;
                        if (!isPairCorrect) isAllCorrect = false;
                        matchingReview += `<li class="${isPairCorrect ? 'correct' : 'incorrect'}">${prompt} ↔️ ${userAns} (Đúng: ${correctAns})</li>`;
                    }
                    matchingReview += '</ul>';
                    detailHTML += matchingReview;
                    break;
                case 'essay':
                    detailHTML += `
                        <div style="background-color: #f0f8ff; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                            <p><strong>Bài làm của học sinh:</strong></p>
                            <p style="white-space: pre-wrap;">${answer.userAnswer}</p>
                        </div>
                        <div class="form-group">
                            <label><strong>Chấm điểm (tối đa ${answer.maxPoints}):</strong></label>
                            <input type="number" step="0.5" class="form-control essay-score-input" 
                                   data-answer-index="${index}" 
                                   value="${answer.gradedPoints !== null ? answer.gradedPoints : ''}" 
                                   placeholder="Nhập điểm"
                                   min="0" max="${answer.maxPoints}">
                        </div>
                    `;
                    break;
            }
            detailHTML += `</div><hr>`;
        });
        
        modalContent.innerHTML = detailHTML;

        const footer = modal.querySelector('.modal-footer');
        let footerHTML = `<button id="delete-from-modal-btn" class="btn btn-danger">Xóa kết quả này</button>`;
        if (resultData.status === 'pending_grading') {
             footerHTML = `<button id="save-grades-btn" class="btn btn-success">Lưu điểm & Hoàn tất chấm</button>` + footerHTML;
        }
        footer.innerHTML = footerHTML;

        footer.querySelector('#delete-from-modal-btn').addEventListener('click', () => deleteResult(docId));
        if (resultData.status === 'pending_grading') {
            footer.querySelector('#save-grades-btn').addEventListener('click', () => saveGrades(docId, resultData));
        }

        modal.style.display = 'block';
    };

    const renderResultRow = (doc) => {
        const resultData = doc.data();
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', doc.id);

        let scoreDisplay = 'N/A';
        if (resultData.status === 'graded') {
            scoreDisplay = `<strong>${resultData.finalScore}</strong> (Đã chấm)`;
        } else if (resultData.status === 'pending_grading') {
            scoreDisplay = `<em>${resultData.autoGradedScore}/${resultData.maxAutoGradedScore} (Chờ chấm)</em>`;
        }

        tr.innerHTML = `
            <td>${resultData.name}</td>
            <td>${scoreDisplay}</td>
            <td>${formatTime(resultData.timeTaken)}</td>
            <td>${resultData.timestamp.toDate().toLocaleString('vi-VN')}</td>
            <td>
                <button class="btn btn-primary view-detail-btn">Xem & Chấm bài</button>
            </td>
        `;

        tr.querySelector('.view-detail-btn').addEventListener('click', () => {
            renderResultDetail(doc.id, resultData);
        });
        
        return tr;
    };
    
    // --- Main Logic ---
    db.collection('results').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        resultsList.innerHTML = ''; 
        if (snapshot.empty) {
            resultsList.innerHTML = '<tr><td colspan="5">Chưa có kết quả nào.</td></tr>';
            return;
        }

        let lastDateString = null;
        snapshot.docs.forEach(doc => {
            const resultData = doc.data();
            if (!resultData.timestamp) return;
            const submissionDate = resultData.timestamp.toDate();
            const currentDateString = submissionDate.toLocaleDateString('vi-VN');

            if (currentDateString !== lastDateString) {
                const separatorRow = document.createElement('tr');
                separatorRow.classList.add('date-separator-row');
                separatorRow.innerHTML = `<td colspan="5" class="date-separator"><h3>Ngày ${currentDateString}</h3></td>`;
                resultsList.appendChild(separatorRow);
                lastDateString = currentDateString;
            }

            const resultRow = renderResultRow(doc);
            resultsList.appendChild(resultRow);
        });

    }, error => {
        console.error("Lỗi khi lấy dữ liệu results: ", error);
        resultsList.innerHTML = '<tr><td colspan="5">Lỗi khi tải dữ liệu.</td></tr>';
    });
});