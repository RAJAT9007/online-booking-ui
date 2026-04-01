import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGateway } from './payment-gate-way';

describe('PaymentGateWay', () => {
  let component: PaymentGateway;
  let fixture: ComponentFixture<PaymentGateway>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentGateway]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentGateway);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
