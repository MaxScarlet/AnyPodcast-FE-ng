import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CookieService } from 'ngx-cookie-service';
import { PodcastService } from './podcast.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Podcast } from '../models/Podcast';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public Podcast = new Podcast();

  public get PodcastID(): string {
    return this.Podcast._id;
  }

  private podcastId = new BehaviorSubject<string>('');
  public PodcastID$ = this.podcastId.asObservable();
  public UserID: string = '';
  public readonly prefixForImage =
    'https://s3.il-central-1.amazonaws.com/web.il.oxymoron-tech.com/';

  private _appVar = new BehaviorSubject<string>('initialValue');
  public appVar$ = this._appVar.asObservable();

  constructor(
    private auth: AuthService,
    private cookieService: CookieService,
    private podcastService: PodcastService
  ) {
    console.log('global service constructor');
  }

  imageURL(fileName: string) {
    if (!fileName) {
      return `${this.prefixForImage}${this.Podcast.PosterName}`;
    }
    return `${this.prefixForImage}${fileName}`;
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


    const userSub = await firstValueFrom(this.auth.user$);
    console.log('userSub: ', userSub);

    if (userSub && userSub.sub) {
      this.UserID = userSub.sub.split('|')[1];

      await this.getPodcastID();
    } else {
    }
  }

  public updateAppVar(newValue: string) {
    this._appVar.next(newValue);
  }

  private async getPodcastID() {
    const cookiePodcastID = this.cookieService.get('podcastID');
    console.log('Cookie ', cookiePodcastID);
    if (cookiePodcastID) {
      const response: Podcast = await firstValueFrom(
        this.podcastService.getByID<Podcast>(cookiePodcastID)
      );
      this.Podcast = response;
      console.log('cookie response', response);
    } else if (this.UserID) {
      console.log('else if getPodcastID');

      try {
        const response: Podcast[] = await firstValueFrom(
          this.podcastService.get<Podcast>(this.UserID)
        );

        console.log('service getPodcastID');

        if (response && response[0]) {
          this.Podcast = response[0];
          this.cookieService.set('podcastID', response[0]._id, { path: '/' });
        } else {
          console.warn('Podcasts not found');
        }
      } catch (error) {
        console.error('Error fetching podcast:', error);
      }
    }
  }
}
