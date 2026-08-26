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
  checkInStatus: 'Checked In' | 'Pending Check-In';
}

export interface TicketHistory {
  id: string;
  serviceId: string;
  ticketNumber: string;
  sequenceNumber: number;
  state: 'Waiting' | 'Called' | 'Serving' | 'Completed' | 'Cancelled' | 'NoShow';
  customerId: string;
  servedByStaffId: string | null;
  checkedInAt: string | null;
  calledAt: string | null;
  servedAt: string | null;
  completedAt: string | null;
  service?: {
    name: string;
    facility?: {
      name: string;
    };
  };
}
