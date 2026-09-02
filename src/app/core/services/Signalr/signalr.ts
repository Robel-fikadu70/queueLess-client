import { Service } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

export interface StatusUpdatePayload {
  ticketId: string;
  ticketNumber: string;
  state: 'CALLED' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
}

export interface PositionChangedPayload {
  serviceId: string;
}

@Service()
export class SignalrService {
  private hubConnection: HubConnection | null = null;

  // RxJS Subjects to expose incoming server broadcasts safely to components
  private statusUpdate$ = new Subject<StatusUpdatePayload>();
  private positionChanged$ = new Subject<PositionChangedPayload>();

  readonly statusUpdate: Observable<StatusUpdatePayload> = this.statusUpdate$.asObservable();
  readonly positionChanged: Observable<PositionChangedPayload> =
    this.positionChanged$.asObservable();

  // 1. Establish connection to `/hubs/queue` (automatically sends HttpOnly Auth cookies)
  connect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      return Promise.resolve();
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/queue') 
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    // Register Hub event listeners matching
    this.hubConnection.on(
      'ReceiveStatusUpdate',
      (ticketId: string, ticketNumber: string, state: any) => {
        this.statusUpdate$.next({ ticketId, ticketNumber, state });
      },
    );

    this.hubConnection.on('QueuePositionChanged', (serviceId: string) => {
      this.positionChanged$.next({ serviceId });
    });

    return this.hubConnection
      .start()
      .then(() => console.log('Successfully connected to SignalR Hub.'))
      .catch((err) => {
        console.error('SignalR Hub Connection failed: ', err);
        throw err;
      });
  }

  // 2. Join Ticket Group (Client-to-Server)
  joinTicketGroup(ticketId: string): void {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection
        .invoke('JoinTicketGroup', ticketId)
        .catch((err) => console.error('Failed to invoke JoinTicketGroup:', err));
    }
  }

  // 3. Join Service Group (Client-to-Server)
  joinServiceGroup(serviceId: string): void {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection
        .invoke('JoinServiceGroup', serviceId)
        .catch((err) => console.error('Failed to invoke JoinServiceGroup:', err));
    }
  }

  // 4. Terminate Connection
  disconnect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      return this.hubConnection.stop().then(() => {
        this.hubConnection = null;
        console.log('SignalR Hub disconnected.');
      });
    }
    return Promise.resolve();
  }
}
