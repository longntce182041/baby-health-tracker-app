/**
 * Bảng màu chính: FDF3F4, FED3DD, F4ABB4, 7EABD0
 * Font: Roboto | H1: 32, H2: 24, H3: 20, P: 15–16
 * Chủ đạo: hồng + trắng, hạn chế xanh
 */
export const colors = {
  background: '#FDF3F4',      // Nền chính (hồng rất nhạt)
  pinkLight: '#FED3DD',       // Hồng nhạt (card, tab bar)
  pinkAccent: '#F4ABB4',      // Hồng đậm (nút, icon)
  blueAccent: '#7EABD0',      // Xanh nhạt (dùng hạn chế)
  navActive: '#E88996',       // Màu bong bóng navbar (giống blueAccent)
  white: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#666666',
  textMuted: '#888888',
  green: '#1E604F',           // Nút "Đặt lịch ngay"
  greenLight: '#C8E6C9',      // Pill "Nhắc lịch"
  red: '#000000',      // Pill "Nhắc lịch"
  lavender: '#E8D5ED',        // Card tím nhạt
  peach: '#FAE4B7',          // Card cam nhạt
};

export const typography = {
  fontFamily: 'Roboto',
  H1: { fontSize: 32, fontWeight: '700' },
  H2: { fontSize: 24, fontWeight: '700' },
  H3: { fontSize: 20, fontWeight: '600' },
  P: { fontSize: 16 },
  PMedium: { fontSize: 14 },
  PSmall: { fontSize: 10 },
};

export default { colors, typography };
