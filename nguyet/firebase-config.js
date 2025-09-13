// /firebase-config.js

// Dữ liệu này bạn đã cung cấp
const firebaseConfig = {
  apiKey: "AIzaSyB7M9y5CS-VTwqV5VGQQH4ynIansrPiC1Y",
  authDomain: "anhnguyet-1577c.firebaseapp.com",
  projectId: "anhnguyet-1577c",
  storageBucket: "anhnguyet-1577c.appspot.com",
  messagingSenderId: "757347105276",
  appId: "1:757347105276:web:2421a9f87f94fefb775a79",
  measurementId: "G-VBVF7Q5Z9B"
};

// Khởi tạo Firebase
const app = firebase.initializeApp(firebaseConfig);
// Khởi tạo Firestore
const db = firebase.firestore();

// Không cần export vì chúng ta sẽ load file này bằng thẻ <script>
// và các biến `app`, `db` sẽ trở thành biến toàn cục.