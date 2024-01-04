import { TestBed } from '@angular/core/testing';

import { AuxFunctionsService } from './aux-functions.service';

describe('AuxFunctionsService', () => {
  let service: AuxFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuxFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
