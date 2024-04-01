import { HttpHeaders } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';

export class ServiceUserAuthorized {
  private userToken: string = '';

  protected headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(public auth: AuthService) {
    this.auth.idTokenClaims$.subscribe((claims) => {
      this.userToken = claims?.__raw || '';
      this.headers = this.headers.set(
        'Authorization',
        `Bearer ${this.userToken}`
      );
    });
  }
}
