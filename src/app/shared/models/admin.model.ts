export interface DashboardStats {
  activeFacilities: number;
  activeServices: number;
  activeStaff: number;
  customersWaiting: number;
  customersServedToday: number;
}

export interface StaffMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedServiceId: string | null;
  assignedServiceName: string | null;
  counterNumber: number | null;
}