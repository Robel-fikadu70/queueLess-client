export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Customer' | 'Staff' | 'Admin'
}
