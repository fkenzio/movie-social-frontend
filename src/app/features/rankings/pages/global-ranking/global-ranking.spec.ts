import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalRanking } from './global-ranking';

describe('GlobalRanking', () => {
  let component: GlobalRanking;
  let fixture: ComponentFixture<GlobalRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalRanking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalRanking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
