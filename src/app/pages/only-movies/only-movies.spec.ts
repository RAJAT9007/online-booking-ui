import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyMovies } from './only-movies';

describe('OnlyMovies', () => {
  let component: OnlyMovies;
  let fixture: ComponentFixture<OnlyMovies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlyMovies]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OnlyMovies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
