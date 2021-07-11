import { TestBed } from '@angular/core/testing';

import { FiltermanagerService } from './filtermanager.service';

describe('FiltermanagerService', () => {
  let service: FiltermanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltermanagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
