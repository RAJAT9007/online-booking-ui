import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTheatre } from './manage-theatre';

describe('ManageTheatre', () => {
  let component: ManageTheatre;
  let fixture: ComponentFixture<ManageTheatre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTheatre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTheatre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
