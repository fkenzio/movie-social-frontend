import { TestBed } from '@angular/core/testing';

import { MovieApi } from './movie-api';

describe('MovieApi', () => {
  let service: MovieApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
