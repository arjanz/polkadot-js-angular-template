import { TestBed } from '@angular/core/testing';

import { PolkadotJsService } from './polkadot-js.service';

describe('PolkadotJsService', () => {
  let service: PolkadotJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolkadotJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
