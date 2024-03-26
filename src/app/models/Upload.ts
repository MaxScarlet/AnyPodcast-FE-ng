import { Part } from './Part';
import { User } from './User';

export class Upload {
  Created?: string = '';
  User: User = new User();
  FileName: string = '';
  UploadId?: string = '';
  TotalParts?: number = 0;
  Parts?: Part[] = [];
  Size?: number = 0;
  IsCompleted?: boolean = false;
  ContentType?: string = '';
  
  constructor(data?: Upload | string) {
    if (data) {
      if (typeof data !== 'object') data = JSON.parse(data);
      Object.assign(this, data);
    } else {
    }
  }
}
