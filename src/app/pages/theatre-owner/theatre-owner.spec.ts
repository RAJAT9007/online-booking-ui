import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheatreOwner } from './theatre-owner';

describe('TheatreOwner', () => {
  let component: TheatreOwner;
  let fixture: ComponentFixture<TheatreOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheatreOwner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheatreOwner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
