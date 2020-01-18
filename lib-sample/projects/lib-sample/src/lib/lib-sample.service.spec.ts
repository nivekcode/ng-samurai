import { TestBed } from '@angular/core/testing';

import { LibSampleService } from './lib-sample.service';

describe('LibSampleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LibSampleService = TestBed.get(LibSampleService);
    expect(service).toBeTruthy();
  });
});
