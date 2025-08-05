// /admin/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('admin-nav-container');
    if (!navContainer) return;

    const currentPage = window.location.pathname.split('/').pop();

    const navHTML = `
        <nav class="admin-nav">
            <a href="dashboard.html" class="${currentPage === 'dashboard.html' ? 'active' : ''}">Tổng quan</a>
            <a href="questions.html" class="${currentPage === 'questions.html' ? 'active' : ''}">Ngân hàng Câu hỏi</a>
            <a href="quiz-sets.html" class="${currentPage === 'quiz-sets.html' ? 'active' : ''}">Quản lý Bộ đề</a>
            <a href="results.html" class="${currentPage === 'results.html' ? 'active' : ''}">Xem Kết quả</a>
        </nav>
    `;

    navContainer.innerHTML = navHTML;
});