import { MOCK_BABIES } from './mockBabies';

export const MOCK_VACCINATIONS = [
  { id: 1, name: 'BCG', status: 'completed', vaccination_date: '2025-01-05' },
  { id: 2, name: 'Viêm gan B 1', status: 'completed', vaccination_date: '2025-01-05' },
  { id: 3, name: 'Viêm gan B 2', status: 'completed', vaccination_date: '2025-02-05' },
  { id: 4, name: '6 trong 1 mũi 1', status: 'completed', vaccination_date: '2025-03-10' },
  { id: 5, name: '6 trong 1 mũi 2', status: 'completed', vaccination_date: '2025-04-10' },
  { id: 6, name: '6 trong 1 mũi 3', status: 'completed', vaccination_date: '2025-05-10' },
  { id: 7, name: 'Rota virus', status: 'completed', vaccination_date: '2025-06-01' },
  { id: 8, name: 'Phế cầu khuẩn', status: 'completed', vaccination_date: '2025-07-01' },
  { id: 9, name: 'Sởi - Quai bị - Rubella mũi 1', status: 'pending', expected_date: '2026-05-15' },
  { id: 10, name: 'Sởi - Quai bị - Rubella mũi 2', status: 'pending', expected_date: '2026-11-15' },
];
export const MOCK_GROWTH_RECORDS = [
  { id: 'gr1', baby_id: 'm1', weight: 3.2, height: 50, head_size: 34, recorded_at: '2025-01-01' },
  { id: 'gr2', baby_id: 'm1', weight: 4.0, height: 54, head_size: 35.5, recorded_at: '2025-02-01' },
  { id: 'gr3', baby_id: 'm1', weight: 5.0, height: 58, head_size: 37, recorded_at: '2025-03-01' },
  { id: 'gr4', baby_id: 'm1', weight: 6.2, height: 62, head_size: 38.5, recorded_at: '2025-04-01' },
  { id: 'gr5', baby_id: 'm1', weight: 7.0, height: 66, head_size: 40, recorded_at: '2025-05-01' },
  { id: 'gr6', baby_id: 'm1', weight: 8.0, height: 70, head_size: 42, recorded_at: '2025-07-01' },
  { id: 'gr7', baby_id: 'm1', weight: 8.6, height: 73, head_size: 44, recorded_at: '2025-09-01' },
  { id: 'gr8', baby_id: 'm1', weight: 9.0, height: 75, head_size: 45, recorded_at: '2025-10-29' },
];

export const MOCK_ALLERGIES = ['Đậu phộng', 'Hải sản', 'Lòng trắng trứng'];

export const MOCK_NEXT_VACCINE = {
  name: 'Sởi - Quai bị - Rubella mũi 1',
  date: '15/05/2026',
};


export function getMockBabyById(id) {
  const found = MOCK_BABIES.find((b) => String(b.baby_id) === String(id) || String(b.id) === String(id));
  const base = found || MOCK_BABIES[0];
  return {
    ...base,
    baby_id: id ?? base.baby_id,
    id: id ?? base.id,
    blood_type: base.blood_type ?? 0,
    allergies: base.allergies || MOCK_ALLERGIES,
  };
}
