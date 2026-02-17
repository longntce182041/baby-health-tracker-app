# Be Tiny – Expo SDK 54

Ứng dụng React Native (Expo) **SDK 54**, tương thích với **Expo Go** phiên bản SDK 54.

## Yêu cầu

- Node.js 20.19.x (khuyến nghị cho SDK 54)
- Expo Go trên điện thoại: **phiên bản dành cho SDK 54**

## Cài đặt và chạy

```bash
# 1. Vào thư mục project
cd BeTiny2

# 2. Cài dependency (đảm bảo dùng đúng SDK 54)
npm install

# 3. Đồng bộ tất cả package với Expo SDK 54 (quan trọng)
npx expo install --fix

# 4. Chạy với cache sạch (tránh lỗi SDK cũ)
npx expo start -c
```

Sau đó mở project bằng **Expo Go (SDK 54)** trên điện thoại (quét QR hoặc nhập URL).

## Lỗi "Project is incompatible with this version of Expo Go"

- Expo Go đọc phiên bản SDK từ `node_modules`, không chỉ từ `package.json`.
- Đảm bảo đã chạy `npm install` và `npx expo install --fix` trong thư mục **BeTiny2**.
- Chạy `npx expo start -c` để xóa cache.
- Trên điện thoại dùng **Expo Go cho SDK 54** (cập nhật từ Store/Play Store nếu cần).

## Cấu trúc

- `App.js` – Entry, AuthProvider, AppNavigator
- `src/context/` – AuthContext
- `src/navigation/` – Stack + Bottom Tabs
- `src/screens/` – Các màn hình (Home, Login, Baby, Doctor, …)
- `src/api/` – Gọi API (auth, baby, doctor, consultation, …)
- `src/storage.js` – AsyncStorage

## API

Mặc định app gọi `http://localhost:5000/api`. Có thể đổi qua biến môi trường `EXPO_PUBLIC_API_URL` hoặc `app.json` → `expo.extra.apiUrl`.
