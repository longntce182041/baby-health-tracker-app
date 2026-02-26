export const DEFAULT_PARENTS_AVATAR = require('../../assets/images/PH.jpg');

export const TEST_PHONE = '0901234567';
export const TEST_PASSWORD = '123456';

export const MOCK_ACCOUNT = {
  id: 'acc-1',
  user_id: 'parent-1',
  doctor_id: null,
  email: 'test@betiny.vn',
  phone: TEST_PHONE,
  password: TEST_PASSWORD,
  status: true,
  role: 'user',
  created_at: '2025-01-01T08:00:00.000Z',
};

export const MOCK_PARENT_PROFILE = {
  id: 'parent-1',
  fullName: 'Mai Đi Tiêm',
  avatar_url: DEFAULT_PARENTS_AVATAR,
  wallet_point: 500,
  email: 'test@betiny.vn',
  role: 'Mẹ',
  created_at: '2025-01-01T08:00:00.000Z',
};

export const TEST_USER = {
  id: MOCK_PARENT_PROFILE.id,
  fullName: MOCK_PARENT_PROFILE.fullName,
  email: MOCK_ACCOUNT.email,
  phone: MOCK_ACCOUNT.phone,
  wallet_point: MOCK_PARENT_PROFILE.wallet_point,
};

