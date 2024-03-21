import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CookieService } from 'ngx-cookie-service';
import { PodcastService } from './podcast.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Podcast } from '../models/Podcast';
import { Router } from '@angular/router';
import { UploadConfig } from '../models/Config';
import { FileMngService } from './file-mng.service';
import { LoggerService } from './logger.service';
import { LogRec } from '../models/LogRec';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public Podcast = new Podcast();

  public get PodcastID(): string {
    return this.Podcast._id;
  }

  public UserID: string = '';
  public uploadConfig: UploadConfig = new UploadConfig();
  private _appVar = new BehaviorSubject<string>('initialValue');
  public appVar$ = this._appVar.asObservable();

  constructor(
    private auth: AuthService,
    private cookieService: CookieService,
    private podcastService: PodcastService,
    private router: Router,
    private fileMngService: FileMngService,
    private logger: LoggerService
  ) {
    this.logWriter('=== start ===', "=== start ===");
    this.logWriter('global service constructor');
  }

  defaultPosterName() {
    return `${this.uploadConfig.BucketPath}/${this.uploadConfig.DefaultPosterName}`;
  }

  imageURL(fileName: string) {
    if (!fileName) {
      return `${this.uploadConfig.URLPrefix}${this.Podcast.PosterName}`;
    }
    return `${this.uploadConfig.URLPrefix}${fileName}`;
  }

  async init() {
    this.logWriter('global service init');
    await this.getUserID();
  }

  public logout() {
    this.auth.logout();
    this.cookieService.delete('podcastID');
  }

  private async getUserID() {
    this.logWriter('get user ID');

    const userSub = await firstValueFrom(this.auth.user$);
    this.logWriter('userSub: ', userSub);

    if (userSub && userSub.sub) {
      this.UserID = userSub.sub.split('|')[1];

      this.uploadConfig = await firstValueFrom(this.fileMngService.getConfig());
      this.logWriter('uploadConfig', this.uploadConfig);

      await this.getPodcast();
      if (!this.Podcast._id) {
        this.router.navigate(['/podcast/create']);
      }
    }
  }

  public async logWriter(msg: string, val?: any): Promise<void> {
    console.log(msg, val);
    // localStorage.setItem(`${this.timeStamp()} | ${msg}`, JSON.stringify(val));
    // const resp = await firstValueFrom(this.logger.create<LogRec>(msg, val));
  }

  private timeStamp(): string {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const milliseconds = currentTime.getMilliseconds();

    // Format the time to display leading zeros if necessary
    const formattedTime = `${hours < 10 ? '0' + hours : hours}:${
      minutes < 10 ? '0' + minutes : minutes
    }:${seconds < 10 ? '0' + seconds : seconds}.${
      milliseconds < 10
        ? '00' + milliseconds
        : milliseconds < 100
        ? '0' + milliseconds
        : milliseconds
    }`;

    return formattedTime;
  }
  public updateAppVar(newValue: string) {
    this._appVar.next(newValue);
  }

  private async getPodcast() {
    const cookiePodcastID = this.cookieService.get('podcastID');
    this.logWriter('Global: getPodcast Cookie', cookiePodcastID);
    if (cookiePodcastID) {
      const response: Podcast = await firstValueFrom(
        this.podcastService.getByID<Podcast>(cookiePodcastID)
      );
      this.Podcast = response;
      this.logWriter('Global: cookie response', response);
    } else if (this.UserID) {
      this.logWriter('else if Global: getPodcast');

      try {
        const response: Podcast[] = await firstValueFrom(
          this.podcastService.get<Podcast>(this.UserID)
        );

        if (response && response[0]) {
          this.Podcast = response[0];
          this.logWriter('Global: getPodcast', this.Podcast);
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
