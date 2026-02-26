const now = new Date();

function minusMinutes(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

function minusHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function minusDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_NOTIFICATIONS = [
  {
    notification_id: 'n1',
    type: 'vaccine',
    title: 'Nhắc lịch tiêm vắc xin 6 trong 1',
    content:
      'Ngày mai bé Mai Mỡ có lịch tiêm vắc xin 6 trong 1. Mẹ nhớ đưa bé đến cơ sở y tế đúng giờ để đảm bảo hiệu quả phòng bệnh tốt nhất nhé.',
    is_read: false,
    created_at: minusMinutes(now, 15),
  },
  {
    notification_id: 'n2',
    type: 'temperature',
    title: 'Theo dõi nhiệt độ của bé',
    content:
      'Nhiệt độ của bé Mai An có xu hướng cao hơn bình thường trong 24 giờ qua. Mẹ nên đo lại nhiệt độ và theo dõi các dấu hiệu bất thường khác.',
    is_read: false,
    created_at: minusHours(now, 3),
  },
  {
    notification_id: 'n3',
    type: 'vaccine',
    title: 'Lịch hẹn khám nhi',
    content:
      'Chiều nay bé Mai Bông có lịch tái khám với bác sĩ nhi. Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.',
    is_read: true,
    created_at: minusDays(now, 1),
  },
  {
    notification_id: 'n4',
    type: 'vaccine',
    title: 'Thành tựu mới của bé',
    content:
      'Chúc mừng mẹ! Bé Mai An đã đạt cột mốc 18 tháng. Hãy ghi lại những khoảnh khắc đáng nhớ và theo dõi các cột mốc phát triển tiếp theo của bé nhé.',
    is_read: false,
    created_at: minusDays(now, 4),
  },
  {
    notification_id: 'n5',
    type: 'reminder',
    title: 'Nhắc mẹ uống nước và nghỉ ngơi',
    content:
      'Đừng quên chăm sóc bản thân nữa mẹ nhé. Uống một cốc nước và nghỉ ngơi vài phút sẽ giúp mẹ có thêm năng lượng chăm bé tốt hơn.',
    is_read: true,
    created_at: minusDays(now, 10),
  },
];

