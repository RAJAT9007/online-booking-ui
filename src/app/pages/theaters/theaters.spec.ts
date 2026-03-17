import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheatersComponent } from './theaters';

describe('Theaters', () => {
  let component: TheatersComponent;
  let fixture: ComponentFixture<TheatersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheatersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TheatersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
