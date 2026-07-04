export type TimeRange = { start: string; end: string };

export type WorkingHours = {
  mon: TimeRange[];
  tue: TimeRange[];
  wed: TimeRange[];
  thu: TimeRange[];
  fri: TimeRange[];
  sat: TimeRange[];
  sun: TimeRange[];
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  mon: [{ start: '09:00', end: '17:00' }],
  tue: [{ start: '09:00', end: '17:00' }],
  wed: [{ start: '09:00', end: '17:00' }],
  thu: [{ start: '09:00', end: '17:00' }],
  fri: [{ start: '09:00', end: '17:00' }],
  sat: [],
  sun: [],
};
