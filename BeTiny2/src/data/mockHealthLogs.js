export const DEFAULT_BABY_HEALTHLOG = require('../../assets/images/be.jpg');

export const MOCK_HEALTH_LOG_GROUPS = [
  {
    dateLabel: 'Hôm nay, 15/10/2025',
    moments: [
      {
        id: '1',
        type: 'photo',
        time: '08:30 Sáng',
        title: 'Bé lần đầu uống trà sữa!',
        desc: 'Hôm nay bé con lần đầu uống trà sữa. Có thể nói là ngon đỉnh nóc kịch trần luôn ạ! Mẹ đã ghi lại khoảnh khắc này để sau này bé lớn xem lại.',
        babyStatus: 'good',
        symptoms: ['Vui vẻ', 'Ăn uống quá trời quá đất'],
        photos: [DEFAULT_BABY_HEALTHLOG, DEFAULT_BABY_HEALTHLOG, DEFAULT_BABY_HEALTHLOG, DEFAULT_BABY_HEALTHLOG],
        health: null,
      },
      {
        id: '2',
        type: 'health',
        time: '02:30 Chiều',
        title: 'Nay bé đi khám định kỳ nè!',
        desc: 'Trộm vía!! Bé lần nào đi khám cũng khóc! Mong App ra cách khắc phục tình trạng này giúp mẹ với ạ.',
        babyStatus: 'normal',
        symptoms: ['Khám định kỳ'],
        photos: null,
        health: [
          { icon: 'scale-outline', value: '10.2 kg' },
          { icon: 'resize-outline', value: '72 cm' },
          { icon: 'thermometer-outline', value: '36.5°C' },
        ],
      },
    ],
  },
  {
    dateLabel: '14/10/2025',
    moments: [
      {
        id: '3',
        type: 'default',
        time: '09:00 Tối',
        title: 'Tận thế mang tên đưa bé đi tiêm',
        desc: 'Bé khóc quá trời! Lần đầu làm mẹ còn hơi bỡ ngỡ huhu!! App nên cho thêm chức năng book hẳn Bác sĩ về khám!.',
        babyStatus: 'bad',
        symptoms: ['Khóc nhiều', 'Sốt nhẹ'],
        photos: null,
        health: null,
      },
    ],
  },
];

