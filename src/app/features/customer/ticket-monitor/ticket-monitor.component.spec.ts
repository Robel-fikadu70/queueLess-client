import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketMonitorComponent } from './ticket-monitor.component';

describe('TicketMonitorComponent', () => {
  let component: TicketMonitorComponent;
  let fixture: ComponentFixture<TicketMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketMonitorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
