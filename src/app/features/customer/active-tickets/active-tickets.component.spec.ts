import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveTicketsComponent } from './active-tickets.component';

describe('ActiveTicketsComponent', () => {
  let component: ActiveTicketsComponent;
  let fixture: ComponentFixture<ActiveTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveTicketsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
