import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { PopupService } from './popup.service';
import { CookieService } from 'ngx-cookie-service';
import { GlobalService } from './global.service';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private countdownThreshold = 30;

  constructor(
    private auth: AuthService,
    private popupService: PopupService,
    private cookieService: CookieService,
    private globalService: GlobalService
  ) {}

  getExpiration() {
    return this.auth.idTokenClaims$.subscribe((token) => {
      const expirationTime = token?.exp! * 1000;
      const currentTime = Date.now();

      let countdown = expirationTime! - currentTime;

      let counter = this.countdownThreshold;
      setTimeout(() => {
        const timeoutID = setTimeout(() => {
          this.globalService.logout();
        }, this.countdownThreshold * 1000);

        const interval = setInterval(() => {
          this.popupService.updateMessage(
            `You will be logged out in ${counter} seconds`
          );
          counter--;
          if (counter < 0) {
            clearInterval(interval);
          }
        }, 1000);

        this.popupService
          .openPopup({
            title: 'Logout warning',
            message: `...`,
            confirmButtonText: 'I am here',
            cancelButtonText: 'Log out',
          })
          .subscribe((result) => {
            if (!result) {
              this.globalService.logout();
            } else {
              this.getExpiration();
            }
            clearTimeout(timeoutID);
          });
      }, countdown - this.countdownThreshold * 1000);
    });
  }
}
