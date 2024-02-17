import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CookieService } from 'ngx-cookie-service';
import { PodcastService } from './podcast.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public PodcastID: string = '';
  private podcastId = new BehaviorSubject<string>('');
  public PodcastID$ = this.podcastId.asObservable();
  public UserID: string = '';

  private _appVar = new BehaviorSubject<string>('initialValue');
  public appVar$ = this._appVar.asObservable();

  constructor(
    private auth: AuthService,
    private cookieService: CookieService,
    private podcastService: PodcastService
  ) {
    console.log('global service constructor');
  }

  async init() {
    console.log('global service init');
    await this.getUserID();
  }

  public logout() {
    this.auth.logout();
    this.cookieService.delete('podcastID');
  }

  private async getUserID() {
    console.log('get user ID');

    // this.auth.user$.subscribe((userSub) => {
    //   console.log('getUserID');

    //   if (userSub && userSub.sub) {
    //     this.UserID = userSub.sub.split('|')[1];
    //     this.getPodcastID();
    //   } else {
    //     // throw new Error('Error getting user ID');
    //   }
    // });

    const userSub = await firstValueFrom(this.auth.user$);
    console.log('userSub: ', userSub);

    if (userSub && userSub.sub) {
      this.UserID = userSub.sub.split('|')[1];

      await this.getPodcastID();
    } else {
      // throw new Error('Error getting user ID');
    }
  }

  public updateAppVar(newValue: string) {
    this._appVar.next(newValue);
  }

  private async getPodcastID() {
    const cookie = this.cookieService.get('podcastID');
    console.log('Cookie ', cookie);
    if (cookie) {
      this.PodcastID = cookie;
      console.log('cookie getPodcastID');
    } else if (this.UserID) {
      console.log('else if getPodcastID');

      try {
        const response = await firstValueFrom(
          this.podcastService.get<any>(this.UserID)
        );

        console.log('service getPodcastID');

        if (response && response[0]) {
          this.PodcastID = response[0]._id;
          this.cookieService.set('podcastID', this.PodcastID, { path: '/' });
        } else {
          console.warn('Podcasts not found');
        }
      } catch (error) {
        console.error('Error fetching podcast:', error);
      }
    }
  }
}
