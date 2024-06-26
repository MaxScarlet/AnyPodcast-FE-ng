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
import { environment } from 'src/environment';
import { LogLevel } from '../models/LogLevel';
import { LogTarget } from '../models/LogTarget';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public UserID: string = '';
  // public userToken: string = '';

  public uploadConfig: UploadConfig = new UploadConfig();

  public Podcast = new Podcast();
  public get PodcastID(): string {
    return this.Podcast._id;
  }

  private _appVar = new BehaviorSubject<string>('initialValue'); // trigger for Episode list to be refreshed after Podcast is changed from popup
  public appVar$ = this._appVar.asObservable();
  public isLoading = true;

  constructor(
    private auth: AuthService,
    private cookieService: CookieService,
    private podcastService: PodcastService,
    private router: Router,
    private fileMngService: FileMngService,
    private logger: LoggerService
  ) {
    this.logWriter('=== start ===', '=== start ===', LogLevel.INFO);
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

      this.fileMngService.getConfig().subscribe(async (config) => {
        this.uploadConfig = config;
        this.logWriter('uploadConfig', this.uploadConfig);
        await this.getPodcast();
        this.isLoading = false;
        if (!this.Podcast._id) {
          this.router.navigate(['/podcast/create']);
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  public async logWriter(
    msg: string,
    val?: any,
    logType: LogLevel = LogLevel.DEBUG
  ): Promise<void> {
    if (logType <= environment.logLevel) {
      switch (environment.logTarget) {
        case LogTarget.SERVICE:
          const strVal = typeof val === 'string' ? val : JSON.stringify(val);
          const resp = await firstValueFrom(
            this.logger.create<LogRec>(msg, strVal, logType)
          );
          break;
        default:
          console.log(`${LogLevel[logType]} ${msg}|`, val);
          break;
      }
    }
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
          this.logWriter('Podcasts not found', '', LogLevel.WARN);
        }
      } catch (error) {
        this.logWriter('Error fetching podcast:', error, LogLevel.ERROR);
      }
    }
  }
}
