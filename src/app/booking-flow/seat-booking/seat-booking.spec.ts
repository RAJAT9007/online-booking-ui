import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatBooking } from './seat-booking';

describe('SeatBooking', () => {
  let component: SeatBooking;
  let fixture: ComponentFixture<SeatBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatBooking]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeatBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
