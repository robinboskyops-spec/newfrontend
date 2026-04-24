import { User, AttendanceRecord, AppNotification } from '../types';

export const INDIA_HOLIDAYS_2026 = [
  { date: '26 Jan', name: 'Republic Day', type: 'NATIONAL' },
  { date: '3 Mar', name: 'Holi', type: 'GAZETTED' },
  { date: '27 Mar', name: 'Eid al-Fitr', type: 'GAZETTED' },
  { date: '2 Apr', name: 'Mahavir Jayanti', type: 'GAZETTED' },
  { date: '3 Apr', name: 'Good Friday', type: 'GAZETTED' },
  { date: '15 Aug', name: 'Independence Day', type: 'NATIONAL' },
  { date: '2 Oct', name: 'Gandhi Jayanti', type: 'NATIONAL' },
  { date: '8 Nov', name: 'Diwali', type: 'GAZETTED' },
  { date: '25 Dec', name: 'Christmas', type: 'NATIONAL' },
  { date: '12 Jun', name: 'Company Foundation Day', type: 'COMPANY' },
] as const;

export const INITIAL_EMPLOYEES: User[] = [];

export const MOCK_ADMIN: User = {
  id: 'adm_1',
  name: 'Robin Bosky',
  role: 'ADMIN',
  position: 'Factory Owner',
};

export const MOCK_MANAGER: User = {
  id: 'mgr_1',
  name: 'Sarah Connor',
  role: 'MANAGER',
  position: 'Site Manager',
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
