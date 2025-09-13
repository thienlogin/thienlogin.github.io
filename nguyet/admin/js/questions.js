// /admin/js/questions.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const questionsList = document.getElementById('questions-list');
    const modal = document.getElementById('question-modal');
    const modalTitle = document.getElementById('modal-title');
    const questionForm = document.getElementById('question-form');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const closeModalBtn = modal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    const questionIdInput = document.getElementById('question-id');
    const questionTypeSelect = document.getElementById('question-type');
    const questionTextInput = document.getElementById('question-text');

    const matchingPairsContainer = document.getElementById('matching-pairs-container');
    const addMatchingPairBtn = document.getElementById('add-matching-pair');

    // --- Form Logic ---
    const showFieldsForType = (type) => {
        document.querySelectorAll('.question-type-fields').forEach(div => div.style.display = 'none');
        document.getElementById(`fields-${type.replace('_', '-')}`).style.display = 'block';
    };

    questionTypeSelect.addEventListener('change', () => showFieldsForType(questionTypeSelect.value));

    const closeModal = () => modal.style.display = 'none';
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
    });

    const addMatchingPair = (prompt = '', answer = '') => {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'form-group matching-pair-row';
        pairDiv.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" class="form-control matching-prompt" placeholder="Vế A (câu hỏi)" value="${prompt}">
                <span>↔️</span>
                <input type="text" class="form-control matching-answer" placeholder="Vế B (đáp án)" value="${answer}">
                <button type="button" class="btn btn-danger remove-pair-btn">×</button>
            </div>
        `;
        matchingPairsContainer.appendChild(pairDiv);
        pairDiv.querySelector('.remove-pair-btn').addEventListener('click', () => pairDiv.remove());
    };
    addMatchingPairBtn.addEventListener('click', () => addMatchingPair());

    // --- Modal Opening Logic ---
    addQuestionBtn.addEventListener('click', () => {
        questionForm.reset();
        questionIdInput.value = '';
        modalTitle.textContent = 'Thêm câu hỏi mới';
        
        questionTypeSelect.value = 'multiple-choice';
        questionTypeSelect.disabled = false;
        
        matchingPairsContainer.innerHTML = '';
        addMatchingPair();
        
        showFieldsForType('multiple-choice');
        modal.style.display = 'block';
    });

    const openEditModal = (doc) => {
        const qData = doc.data();
        questionForm.reset();
        questionIdInput.value = doc.id;
        modalTitle.textContent = 'Sửa câu hỏi';

        questionTextInput.value = qData.text;
        questionTypeSelect.value = qData.type;
        questionTypeSelect.disabled = true;
        
        matchingPairsContainer.innerHTML = '';
        switch (qData.type) {
            case 'multiple-choice':
                document.getElementById('option-a').value = qData.options.A || '';
                document.getElementById('option-b').value = qData.options.B || '';
                document.getElementById('option-c').value = qData.options.C || '';
                document.getElementById('option-d').value = qData.options.D || '';
                document.getElementById('correct-answer').value = qData.correct;
                break;
            case 'matching':
                if (qData.pairs && qData.pairs.length > 0) {
                    qData.pairs.forEach(pair => addMatchingPair(pair.prompt, pair.answer));
                } else {
                    addMatchingPair();
                }
                break;
            case 'essay':
                document.getElementById('max-points').value = qData.maxPoints;
                break;
        }
        showFieldsForType(qData.type);
        modal.style.display = 'block';
    };

    // --- Firestore Logic ---
    const renderQuestionRow = (doc) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', doc.id);
        const qData = doc.data();
        const typeMap = { 'multiple-choice': 'Trắc nghiệm', 'matching': 'Nối đáp án', 'essay': 'Tự luận' };
        tr.innerHTML = `
            <td>${qData.text.substring(0, 50)}${qData.text.length > 50 ? '...' : ''}</td>
            <td>${typeMap[qData.type] || 'Không rõ'}</td>
            <td>${qData.timestamp ? qData.timestamp.toDate().toLocaleDateString('vi-VN') : 'N/A'}</td>
            <td>
                <button class="btn btn-warning edit-btn">Sửa</button>
                <button class="btn btn-danger delete-btn">Xóa</button>
            </td>
        `;
        questionsList.appendChild(tr);
        tr.querySelector('.edit-btn').addEventListener('click', () => openEditModal(doc));
        tr.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
                db.collection('questions').doc(doc.id).delete();
            }
        });
    };

    questionForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Luôn ngăn chặn hành vi mặc định
        
        const id = questionIdInput.value;
        let questionData = { type: questionTypeSelect.value };

        // --- BẮT ĐẦU KIỂM TRA DỮ LIỆU THỦ CÔNG ---
        questionData.text = questionTextInput.value.trim();
        if (!questionData.text) {
            alert('Vui lòng nhập nội dung câu hỏi.');
            return;
        }

        switch (questionData.type) {
            case 'multiple-choice':
                const options = {};
                const optA = document.getElementById('option-a').value.trim();
                const optB = document.getElementById('option-b').value.trim();
                if (!optA || !optB) {
                    alert('Vui lòng nhập ít nhất lựa chọn A và B.');
                    return;
                }
                options.A = optA;
                options.B = optB;
                if (document.getElementById('option-c').value.trim()) options.C = document.getElementById('option-c').value.trim();
                if (document.getElementById('option-d').value.trim()) options.D = document.getElementById('option-d').value.trim();
                questionData.options = options;
                questionData.correct = document.getElementById('correct-answer').value;
                break;

            case 'matching':
                const pairs = [];
                document.querySelectorAll('#matching-pairs-container .matching-pair-row').forEach(pairDiv => {
                    const prompt = pairDiv.querySelector('.matching-prompt').value.trim();
                    const answer = pairDiv.querySelector('.matching-answer').value.trim();
                    if (prompt && answer) pairs.push({ prompt, answer });
                });
                if (pairs.length === 0) {
                     alert("Vui lòng nhập ít nhất một cặp nối.");
                     return;
                }
                questionData.pairs = pairs;
                break;

            case 'essay':
                const maxPoints = parseInt(document.getElementById('max-points').value, 10);
                if (isNaN(maxPoints) || maxPoints < 1) {
                    alert("Điểm tối đa cho câu tự luận phải là một số lớn hơn 0.");
                    return;
                }
                questionData.maxPoints = maxPoints;
                break;
        }
        // --- KẾT THÚC KIỂM TRA DỮ LIỆU ---

        // Nếu mọi thứ đều hợp lệ, tiến hành lưu hoặc cập nhật
        if (id) {
            db.collection('questions').doc(id).update(questionData).then(closeModal).catch(err => console.error("Update error: ", err));
        } else {
            questionData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            db.collection('questions').add(questionData).then(closeModal).catch(err => console.error("Add error: ", err));
        }
    });

    db.collection('questions').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        questionsList.innerHTML = '';
        snapshot.docs.forEach(doc => renderQuestionRow(doc));
    }, error => {
        console.error("Lỗi khi tải câu hỏi: ", error);
        if (error.code === 'failed-precondition') {
             alert('Lỗi: Cần tạo Index trong Firestore. Vui lòng xem hướng dẫn trong Console (F12) của trình duyệt để tạo.');
        }
    });
});