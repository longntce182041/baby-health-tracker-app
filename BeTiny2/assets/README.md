Thêm các file sau (nếu cần) để tránh cảnh báo khi build:
- icon.png (1024x1024)
- splash.png (1284x2778)
- adaptive-icon.png (1024x1024)

**Logo Bé Tiny (màn Đăng ký):** Thêm file `logo.png` vào thư mục `assets/`. Trong `src/screens/RegisterScreen.jsx`, thay phần `logoPlaceholder` bằng:
`<Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />`
để hiển thị logo của bạn thay vì placeholder (emoji + chữ).
