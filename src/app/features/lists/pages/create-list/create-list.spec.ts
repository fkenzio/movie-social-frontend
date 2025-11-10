import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateList } from './create-list';

describe('CreateList', () => {
  let component: CreateList;
  let fixture: ComponentFixture<CreateList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
