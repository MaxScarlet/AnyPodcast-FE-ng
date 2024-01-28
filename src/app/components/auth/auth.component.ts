import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { GlobalService } from 'src/app/services/global.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-auth-button',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthButtonComponent {
  public user: any;

  ngOnInit(): void {
    this.auth.user$.subscribe((userSub) => {
      if (userSub && userSub.sub) {
        this.user = userSub;
        this.globalService.UserID = this.user.sub.split('|')[1];
      }
    });
  }

  authLogout(): void {
    this.cookieService.delete('podcastID');
    this.auth.logout();
  }

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    public globalService: GlobalService,
    private cookieService: CookieService
  ) {}
}
