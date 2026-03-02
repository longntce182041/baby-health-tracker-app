export const DEFAULT_DOCTOR_AVATAR = require('../../assets/images/bsNguyen.jpg');

function makeWeekSchedules(offset = 0) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset + i);
    out.push(
      { available_date: d.toISOString().slice(0, 10), time_slot: '09:00 - 12:00' },
      { available_date: d.toISOString().slice(0, 10), time_slot: '14:00 - 17:00' }
    );
  }
  return out.slice(0, 7);
}

export const MOCK_DOCTORS = [
  {
    _id: 'd1',
    full_name: 'Mai Nguyên',
    avatar_url: DEFAULT_DOCTOR_AVATAR,
    specialty: 'Tai mũi họng',
    rating: 4.8,
    is_consulting: true,
    status: 'busy',
    experience: '15 năm kinh nghiệm, Chuyên gia tai mũi họng.',
    schedules: makeWeekSchedules(0),
    consultation_fee: 10
  },
  {
    _id: 'd2',
    full_name: 'Đăng Khôi',
    avatar_url: null,
    specialty: 'Nhi khoa',
    rating: 4.9,
    is_consulting: false,
    status: 'online',
    experience: '12 năm kinh nghiệm, Chuyên gia nhi khoa.',
    schedules: makeWeekSchedules(1),
    consultation_fee: 15,
  },
  {
    _id: 'd3',
    full_name: 'Cường',
    avatar_url: null,
    specialty: 'Nhi khoa',
    rating: 4.5,
    is_consulting: false,
    status: 'online',
    experience: '10 năm kinh nghiệm, Bác sĩ nhi khoa.',
    schedules: makeWeekSchedules(2),
    consultation_fee: 12,
  },
  {
    _id: 'd4',
    full_name: 'Mai',
    avatar_url: null,
    specialty: 'Sơ sinh',
    rating: 5,
    is_consulting: false,
    status: 'online',
    experience: '18 năm kinh nghiệm, Chuyên gia sơ sinh.',
    schedules: makeWeekSchedules(0),
    consultation_fee: 20,
  },
  {
    _id: 'd5',
    full_name: 'Nam',
    avatar_url: null,
    specialty: 'Dinh dưỡng',
    rating: 4.6,
    is_consulting: false,
    status: 'online',
    experience: '8 năm kinh nghiệm, Chuyên gia dinh dưỡng trẻ em.',
    schedules: makeWeekSchedules(3),
    consultation_fee: 12,
  },
  {
    _id: 'd6',
    full_name: 'Hương',
    avatar_url: null,
    specialty: 'Tâm lý bé',
    rating: 4.7,
    is_consulting: false,
    status: 'online',
    experience: '11 năm kinh nghiệm, Chuyên gia tâm lý trẻ em.',
    schedules: makeWeekSchedules(1),
    consultation_fee: 18,
  },
];

export function getMockDoctorById(id) {
  const found = MOCK_DOCTORS.find(
    (d) => String(d._id) === String(id) || String(d.doctor_id) === String(id)
  );
  return found || MOCK_DOCTORS[0];
}

export const MOCK_DOCTOR_SCHEDULES = [
  { available_date: new Date().toISOString().slice(0, 10), time_slot: '09:00' },
  { available_date: new Date().toISOString().slice(0, 10), time_slot: '10:00' },
  { available_date: new Date().toISOString().slice(0, 10), time_slot: '14:00' },
];

export const MOCK_DOCTOR_REVIEWS = [
  { rating: 5, comment: 'Bác sĩ tư vấn rất tận tình.', created_at: new Date().toISOString() },
  { rating: 4, comment: 'Hài lòng.', created_at: new Date().toISOString() },
];
