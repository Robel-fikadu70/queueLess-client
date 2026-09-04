export type FacilityStatus = 'Open' | 'Paused' | 'Closed';

export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  operatingHours: string;
  status: 'Open' | 'Paused' | 'Closed';
  createdAt: string;
  lastModifiedAt: string | null;
}

export enum QueueStatus
{
    Open,
    Paused,
    Closed
}
export enum TicketState
{
    Waiting,
    Called,
    CheckedIn,
    Serving,
    Completed,
    Cancelled,
    NoShow
}

export interface QueueService {
  id: string;
  facilityId: string;
  name: string;
  description: string;
  estimatedDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface TicketDashboard {
  facilityName: string;
  serviceName: string;
  ticketNumber: string;
  peopleAhead: number;
  currentTicketBeingServed: string; // Ticket Number or "None"
  estimatedWaitRange: string; // Formatted based on active counters
  queueStatus: 'OPEN' | 'PAUSED' | 'CLOSED';
  checkInStatus: TicketState;
}

export interface TicketHistory {
  ticketId: string;
  ticketNumber: string;
  serviceName: string;
  facilityName: string;
  status: string;
  createdAt: string;
}

export interface ActiveTicket {
  ticketId: string;
  ticketNumber: string;
  serviceName: string;
  facilityName: string;
  status: 'WAITING' | 'CALLED' | 'SERVING';
  createdAt: string;
}
