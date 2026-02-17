
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

const now = new Date();

export const DEFAULT_BABY_AVATAR = require('../../assets/images/be.jpg');
export const DEFAULT_BABY_AVATAR2 = require('../../assets/images/beAn.jpg');
export const DEFAULT_BABY_AVATAR3 = require('../../assets/images/beBong.jpg');

export const BLOOD_TYPE_CODE = {
  UNKNOWN: 0,
  A: 1,
  B: 2,
  O: 3,
  AB: 4,
};

export const MOCK_BABIES = [
  {
    baby_id: 'm1',
    parent_id: 'p1',
    full_name: 'Mai Mỡ',
    date_of_birth: addMonths(now, 35),
    gender: 'Nữ',
    blood_type: 3,
    allergies: ['Đậu phộng', 'Hải sản', 'Bí'],
    avt: DEFAULT_BABY_AVATAR,
  },
  {
    baby_id: 'm2',
    parent_id: 'p1',
    full_name: 'Mai Bông',
    date_of_birth: addMonths(now, 54),
    gender: 'Nữ',
    blood_type: 1,
    allergies: ['Hải sản'],
    avt: DEFAULT_BABY_AVATAR3,
  },
  {
    baby_id: 'm3',
    parent_id: 'p1',
    full_name: 'Mai An',
    date_of_birth: addMonths(now, 18),
    gender: 'Nam',
    blood_type: 2,
    allergies: ['Lòng trắng trứng'],
    avt: DEFAULT_BABY_AVATAR2,
  },
];
