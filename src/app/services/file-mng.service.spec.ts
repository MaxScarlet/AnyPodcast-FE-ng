import { TestBed } from '@angular/core/testing';

import { FileMngService } from './file-mng.service';

describe('FileMngService', () => {
  let service: FileMngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileMngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
