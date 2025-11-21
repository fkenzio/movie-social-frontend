import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToListModal } from './add-to-list-modal';

describe('AddToListModal', () => {
  let component: AddToListModal;
  let fixture: ComponentFixture<AddToListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToListModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
