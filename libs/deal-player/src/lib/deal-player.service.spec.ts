import { TestBed } from '@angular/core/testing';

import { DealPlayerService } from './deal-player.service';

describe('DealPlayerService', () => {
  let service: DealPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DealPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
