export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string; // Fallback fallback token wrapper
}
