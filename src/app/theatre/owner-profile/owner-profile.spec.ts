import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerProfileComponent } from './owner-profile';

describe('OwnerProfile', () => {
  let component: OwnerProfileComponent;
  let fixture: ComponentFixture<OwnerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerProfileComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OwnerProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
