export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Customer' | 'Staff' | 'Admin';
  assignedServiceId?: string | null;
  assignedServiceName?: string | null;
  counterNumber?: number | null;
}
