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

document.addEventListener('DOMContentLoaded', function() {
    
    // --- PHẦN 1: ĐIỀU KHIỂN HIỆU ỨNG RÈM CỬA ---
    const curtainContainer = document.getElementById('curtain-container');
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

        // ẨN HOÀN TOÀN KHUNG RÈM SAU KHI HIỆU ỨNG KẾT THÚC
        setTimeout(() => {
            if (curtainContainer) {
                curtainContainer.style.display = 'none';
            }
        }, 2000); // 2 giây
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
    revealElements();

    // ===================================================================
    // --- PHẦN 3: THÊM MỚI - TẠO HIỆU ỨNG MƯA TRÁI TIM ---
    // ===================================================================
    const rainContainer = document.getElementById('heart-rain-container');

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        // Vị trí bắt đầu ngẫu nhiên theo chiều ngang
        heart.style.left = Math.random() * 100 + 'vw';

        // Thời gian rơi ngẫu nhiên để các trái tim có tốc độ khác nhau
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's'; // từ 4 đến 7 giây

        // Kích thước ngẫu nhiên
        const size = Math.random() * 20 + 20 + 'px'; // từ 10px đến 20px
        heart.style.width = size;
        heart.style.height = size;
        heart.style.setProperty('--heart-size', size); // Cập nhật kích thước cho before/after
        
        // Độ trong suốt ngẫu nhiên
        heart.style.opacity = Math.random() * 0.5 + 0.3; // từ 0.3 đến 0.8
        
        rainContainer.appendChild(heart);

        // Xóa trái tim khỏi DOM sau khi nó rơi xong để không làm chậm trang web
        setTimeout(() => {
            heart.remove();
        }, 7000); // Thời gian này phải lớn hơn animationDuration tối đa
    }

    // Cứ mỗi 300ms thì tạo một trái tim mới
    setInterval(createHeart, 1000);



    // 
    const wishForm = document.getElementById('wish-form');
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const wishesList = document.getElementById('wishes-list');

    // 1. GỬI LỜI CHÚC LÊN FIREBASE
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Ngăn trang tải lại khi gửi form

        const name = nameInput.value;
        const message = messageInput.value;

        // Thêm một document mới vào collection tên là "wishes"
        db.collection('wishes').add({
            name: name,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Thêm dấu thời gian
        })
        .then((docRef) => {
            console.log("Lời chúc đã được gửi với ID: ", docRef.id);
            alert('Cảm ơn bạn đã gửi lời chúc!');
            // Xóa nội dung trong form sau khi gửi thành công
            wishForm.reset();
        })
        .catch((error) => {
            console.error("Lỗi khi gửi lời chúc: ", error);
            alert('Đã có lỗi xảy ra, vui lòng thử lại.');
        });
    });

    // 2. LẤY VÀ HIỂN THỊ LỜI CHÚC TỪ FIREBASE
    // Sắp xếp theo thời gian, lời chúc mới nhất sẽ ở trên cùng
    db.collection('wishes').orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => {
        wishesList.innerHTML = ''; // Xóa danh sách cũ trước khi hiển thị danh sách mới

        if (querySnapshot.empty) {
            wishesList.innerHTML = '<p style="color: #888;">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const wish = doc.data();
            
            // Tạo một card HTML cho mỗi lời chúc
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';
            
            const wishName = document.createElement('strong');
            wishName.textContent = wish.name;

            const wishMessage = document.createElement('p');
            wishMessage.textContent = wish.message;

            wishCard.appendChild(wishName);
            wishCard.appendChild(wishMessage);

            wishesList.appendChild(wishCard);
        });
    });


});

