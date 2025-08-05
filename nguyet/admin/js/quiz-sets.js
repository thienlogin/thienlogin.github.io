// /admin/js/quiz-sets.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const setsList = document.getElementById('sets-list');
    const modal = document.getElementById('set-modal');
    const modalTitle = document.getElementById('modal-title');
    const setForm = document.getElementById('set-form');
    const addSetBtn = document.getElementById('add-set-btn');
    const closeModalBtn = modal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const questionSelectionList = document.getElementById('question-selection-list');
    const selectedCountSpan = document.getElementById('selected-count');
    const questionSearchInput = document.getElementById('question-search');

    let allQuestions = []; // Cache to store all questions from the bank

    // --- Modal Logic ---
    const closeModal = () => modal.style.display = 'none';
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // --- Data Fetching ---
    const fetchAllQuestions = async () => {
        if (allQuestions.length > 0) return; // Use cache if available
        try {
            const snapshot = await db.collection('questions').orderBy('timestamp', 'desc').get();
            allQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching questions: ", error);
        }
    };

    // --- UI Rendering ---
    const renderQuestionSelection = (selectedIds = [], searchTerm = '') => {
        questionSelectionList.innerHTML = '';
        const filteredQuestions = allQuestions.filter(q => 
            q.text.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredQuestions.length === 0) {
            questionSelectionList.innerHTML = '<p>Không tìm thấy câu hỏi nào.</p>';
            return;
        }

        filteredQuestions.forEach(q => {
            const isChecked = selectedIds.includes(q.id);
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${q.id}" ${isChecked ? 'checked' : ''}>
                <span>${q.text.substring(0, 80)}${q.text.length > 80 ? '...' : ''}</span>
            `;
            questionSelectionList.appendChild(label);
        });
        updateSelectedCount();
    };
    
    const updateSelectedCount = () => {
        const count = questionSelectionList.querySelectorAll('input[type="checkbox"]:checked').length;
        selectedCountSpan.textContent = count;
    };
    
    questionSelectionList.addEventListener('change', updateSelectedCount);
    questionSearchInput.addEventListener('input', () => {
        const selectedIds = Array.from(questionSelectionList.querySelectorAll('input:checked')).map(cb => cb.value);
        renderQuestionSelection(selectedIds, questionSearchInput.value);
    });

    // --- Modal Opening Logic ---
    const openSetModal = async (doc = null) => {
        setForm.reset();
        await fetchAllQuestions();
        let selectedIds = [];

        if (doc) { // Edit mode
            const setData = doc.data();
            modalTitle.textContent = 'Sửa bộ đề';
            document.getElementById('set-id').value = doc.id;
            document.getElementById('set-name').value = setData.name;
            document.getElementById('set-description').value = setData.description || '';
            selectedIds = setData.questionIds || [];
        } else { // Add mode
            modalTitle.textContent = 'Tạo bộ đề mới';
            document.getElementById('set-id').value = '';
        }

        renderQuestionSelection(selectedIds, '');
        modal.style.display = 'block';
    };

    addSetBtn.addEventListener('click', () => openSetModal());

    // --- Form Submission ---
    setForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const setName = document.getElementById('set-name').value.trim();
        if (!setName) {
            alert('Vui lòng nhập tên bộ đề.');
            return;
        }

        const selectedIds = Array.from(questionSelectionList.querySelectorAll('input:checked')).map(cb => cb.value);
        if (selectedIds.length === 0) {
            alert('Vui lòng chọn ít nhất một câu hỏi cho bộ đề.');
            return;
        }

        const setId = document.getElementById('set-id').value;
        const setData = {
            name: setName,
            description: document.getElementById('set-description').value.trim(),
            questionIds: selectedIds,
        };

        try {
            if (setId) { // Update
                await db.collection('quiz_sets').doc(setId).update(setData);
            } else { // Add new
                setData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('quiz_sets').add(setData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving quiz set: ", error);
            alert('Đã xảy ra lỗi khi lưu bộ đề.');
        }
    });
    
    // --- Main Logic: Render Quiz Sets Table ---
    db.collection('quiz_sets').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        setsList.innerHTML = '';
        if (snapshot.empty) {
            setsList.innerHTML = '<tr><td colspan="4">Chưa có bộ đề nào. Hãy tạo một bộ đề mới!</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const setData = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${setData.name}</td>
                <td>${setData.questionIds.length}</td>
                <td>${setData.createdAt ? setData.createdAt.toDate().toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>
                    <button class="btn btn-warning edit-btn">Sửa</button>
                    <button class="btn btn-danger delete-btn">Xóa</button>
                </td>
            `;
            setsList.appendChild(tr);

            tr.querySelector('.edit-btn').addEventListener('click', () => openSetModal(doc));
            tr.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm(`Bạn có chắc muốn xóa bộ đề "${setData.name}" không?`)) {
                    await db.collection('quiz_sets').doc(doc.id).delete();
                }
            });
        });
    });
});