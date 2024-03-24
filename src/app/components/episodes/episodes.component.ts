import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Episode } from 'src/app/models/Episode';
import { LogRec } from 'src/app/models/LogRec';
import { Upload } from 'src/app/models/Upload';
import { GlobalService } from 'src/app/services/global.service';
import { LoggerService } from 'src/app/services/logger.service';
import { PopupService } from 'src/app/services/popup.service';
import { environment } from 'src/environment';
import { EpisodeService } from '../../services/episode.service';
import { LogLevel } from 'src/app/models/LogLevel';
@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css'],
})
export class EpisodesComponent implements OnDestroy {
  public episodeList: Episode[] = [];
  private podcastID: string = '';
  private subscription: Subscription;
  public isLoading: boolean = false;
  private fileMngUrl = `${environment.fileMngUrl}/upload`;
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(
    private episodeService: EpisodeService,
    public globalService: GlobalService,
    public dialog: MatDialog,
    private popupService: PopupService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.subscription = this.globalService.appVar$.subscribe((value) => {
      this.globalService.logWriter('Episodes: appVar$.subscribe');
      this.init();
    });
  }

  async init() {
    try {
      this.podcastID = this.globalService.PodcastID;
      this.fetchEpisodes();
    } catch (err) {
      this.globalService.logWriter(
        'Failed to fetch episodes',
        err,
        LogLevel.ERROR
      );
    }
  }

  ngOnDestroy() {
    this.globalService.logWriter('Episodes: ngOnDestroy');
    this.subscription.unsubscribe();
  }

  //TODO: fix caching issue for images
  fetchEpisodes(): void {
    this.isLoading = true;
    this.episodeList = [];
    this.episodeService.get<Episode>(this.podcastID).subscribe(
      (response) => {
        this.episodeList = response;
        for (let i = 0; i < this.episodeList.length; i++) {
          const item = this.episodeList[i];
          item.PosterName = this.globalService.imageURL(item.PosterName);

          const createdDate = new Date(item.Created);
          const formattedDate = createdDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          });

          item.Created = formattedDate;
        }
        this.episodeList.reverse();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching episodes:', error);
        this.isLoading = false;
      }
    );
  }

  openPrompt(episode: any) {
    this.popupService
      .openPopup({
        title: 'Delete Episode',
        message: `Are you sure you want to delete "${episode.Title}"`,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      })
      .subscribe((result) => {
        if (result) {
          this.deleteEpisode(episode);
        }
      });
  }

  deleteEpisode(episode: Episode): void {
    this.episodeService.delete(episode._id).subscribe(
      (response) => {
        this.http
          .patch<any>(
            `${this.fileMngUrl}`,
            [{ fileName: episode.PosterName }, { fileName: episode.MediaFile }],
            {
              headers: this.headers,
            }
          )
          .subscribe(
            (resp: Upload) => {
              this.globalService.logWriter('Deleted Episode', resp);
            },
            (error: HttpErrorResponse) => {
              console.error('Error initiating multipart upload', error);
            }
          );
        this.fetchEpisodes();
      },
      (error) => {
        console.error('Failed to delete episodes', error);
      }
    );
  }
}
