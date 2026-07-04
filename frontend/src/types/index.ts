export type Role = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

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

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  providerProfile?: {
    id: string;
    bio: string | null;
    workingHours: WorkingHours;
  };
};

export type Service = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  price: number;
  provider?: {
    id: string;
    name: string;
  };
};

export type ProviderDetail = {
  id: string;
  bio: string | null;
  workingHours: WorkingHours;
  provider: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  services: Service[];
};

export type Slot = {
  startTime: string;
  endTime: string;
};

export type Booking = {
  id: string;
  clientId: string;
  serviceId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  provider: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
    };
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
};
