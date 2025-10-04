document.addEventListener('DOMContentLoaded', function() {
    
    // --- PHẦN 1: ĐIỀU KHIỂN HIỆU ỨNG RÈM CỬA ---
    const curtainContainer = document.getElementById('curtain-container'); // Thêm dòng này
    const curtainLeft = document.getElementById('curtain-left');
    const curtainRight = document.getElementById('curtain-right');

    window.addEventListener('load', () => {
        // Mở rèm trái
        setTimeout(() => {
            curtainLeft.classList.add('opened');
        }, 200);

        // Mở rèm phải
        setTimeout(() => {
            curtainRight.classList.add('opened');
        }, 200);

        // ===================================================================
        // --- SỬA LỖI Ở ĐÂY ---
        // ẨN HOÀN TOÀN KHUNG RÈM SAU KHI HIỆU ỨNG KẾT THÚC
        setTimeout(() => {
            if (curtainContainer) {
                curtainContainer.style.display = 'none';
            }
        }, 2000); // 3 giây, đủ thời gian để rèm mở xong
        // ===================================================================
    });


    // --- PHẦN 2: ĐIỀU KHIỂN HIỆU ỨNG KHI CUỘN ---
    const animatedElements = document.querySelectorAll('[class*="animate-"]');

    const revealElements = () => {
        const triggerBottom = window.innerHeight / 5 * 4.5;

        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.add('is-visible');
            }
        });
    };

    window.addEventListener('scroll', revealElements);

    // Kích hoạt lần đầu để kiểm tra các phần tử đã có trong màn hình
    revealElements();
});