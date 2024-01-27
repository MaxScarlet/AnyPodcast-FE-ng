import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CookieService } from 'ngx-cookie-service';
import { PodcastService } from './podcast.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  PodcastID: string = '';
  UserID: string = '';

  constructor(
    private auth: AuthService,
    private cookieService: CookieService,
    private podcastService: PodcastService
  ) {
    this.getUserID();
  }

  getUserID(): void {
    this.auth.user$.subscribe((userSub) => {
      if (userSub && userSub.sub) {
        this.UserID = userSub.sub.split('|')[1];
        this.getPodcastID();
      } else {
        // throw new Error('Error getting user ID');
      }
    });
  }

  getPodcastID(): void {
    const cookie = this.cookieService.get('podcastID');
    if (cookie) {
      this.PodcastID = cookie;
    } else if (this.UserID) {
      this.podcastService.get<any>(this.UserID).subscribe(
        (response) => {
          this.PodcastID = response[0]._id;
          this.cookieService.set('podcastID', this.PodcastID);
        },
        (error) => {
          console.error('Error fetching episodes:', error);
        }
      );
    }
  }
}
