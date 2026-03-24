import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerTheatreComponent } from './owner-theatres';

describe('OwnerTheatreComponent', () => {
  let component: OwnerTheatreComponent;
  let fixture: ComponentFixture<OwnerTheatreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerTheatreComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OwnerTheatreComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
