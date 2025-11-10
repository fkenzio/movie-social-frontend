import { TestBed } from '@angular/core/testing';

import { Rankings } from './rankings';

describe('Rankings', () => {
  let service: Rankings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rankings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
