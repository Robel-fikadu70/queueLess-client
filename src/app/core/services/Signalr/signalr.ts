import { Service } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { TicketState } from '../../../shared/models/queue.model';

export interface StatusUpdatePayload {
  ticketId: string;
  ticketNumber: string;
  state: TicketState;
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
      console.log(`[SignalR] Connection already in state: ${this.hubConnection.state}`);
      return Promise.resolve();
    }

    console.log('[SignalR] Initiating WebSocket handshake with /hubs/queue...');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/queue') // Targets our Vite proxy
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    // 1. Receives a single anonymous object payload matching your C# anonymous types
    this.hubConnection.on(
      'ReceiveStatusUpdate',
      (payload: { ticketId: string; ticketNumber: string; state: any }) => {
        console.log(
          `[SignalR] Broadcast Received: ReceiveStatusUpdate -> Ticket: ${payload.ticketNumber}, State: ${payload.state}`,
        );
        this.statusUpdate$.next({
          ticketId: payload.ticketId,
          ticketNumber: payload.ticketNumber,
          state: payload.state,
        });
      },
    );

    // 2. Receives a single anonymous object payload matching your C# anonymous types
    this.hubConnection.on('QueuePositionChanged', (payload: { serviceId: string }) => {
      console.log(
        `[SignalR] Broadcast Received: QueuePositionChanged -> ServiceId: ${payload.serviceId}`,
      );
      this.positionChanged$.next({ serviceId: payload.serviceId });
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn('[SignalR] Connection lost. Attempting to reconnect silently...', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('[SignalR] Connection restored successfully. ID:', connectionId);
    });

    return this.hubConnection
      .start()
      .then(() => {
        console.log('[SignalR] WebSocket connection successfully established and active.');
      })
      .catch((err) => {
        console.error('[SignalR] WebSocket handshake failed:', err);
        throw err;
      });
  }

  // 2. Join Ticket Group (Client-to-Server)
  joinTicketGroup(ticketId: string): void {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      console.log(`[SignalR] Requesting subscription to Group: Ticket-${ticketId}`);
      this.hubConnection
        .invoke('JoinTicketGroup', ticketId)
        .then(() => console.log(`[SignalR] Successfully subscribed to Group: Ticket-${ticketId}`))
        .catch((err) => console.error(`[SignalR] Failed to join Group: Ticket-${ticketId}`, err));
    } else {
      console.warn('[SignalR] Cannot join ticket group. Connection is not active.');
    }
  }

  // 3. Join Service Group (Client-to-Server)
  joinServiceGroup(serviceId: string): void {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      console.log(`[SignalR] Requesting subscription to Group: Service-${serviceId}`);
      this.hubConnection
        .invoke('JoinServiceGroup', serviceId)
        .then(() => console.log(`[SignalR] Successfully subscribed to Group: Service-${serviceId}`))
        .catch((err) => console.error(`[SignalR] Failed to join Group: Service-${serviceId}`, err));
    } else {
      console.warn('[SignalR] Cannot join service group. Connection is not active.');
    }
  }

  // 4. Terminate Connection
  disconnect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      return this.hubConnection.stop().then(() => {
        this.hubConnection = null;
        console.log('[SignalR] Connection closed.');
      });
    }
    return Promise.resolve();
  }
}
