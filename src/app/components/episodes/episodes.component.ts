import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { PopupService } from 'src/app/services/popup.service';
import { EpisodeService } from '../../services/episode.service';
import { Episode } from 'src/app/models/Episode';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Upload } from 'src/app/models/Upload';
import { environment } from 'src/environment';

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
    private http: HttpClient
  ) {
    console.log('Episodes Constructor');
    this.subscription = this.globalService.appVar$.subscribe((value) => {
      console.log('appVar$.subscribe');
      this.init();
    });
  }

  async init() {
    try {
      this.podcastID = this.globalService.PodcastID;
      this.fetchEpisodes();
    } catch (err) {
      console.error();
    }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    this.subscription.unsubscribe();
  }

  //TODO: fix caching issue for images
  fetchEpisodes(): void {
    this.isLoading = true;
    console.log(this.episodeList);

    this.episodeList = [];
    this.episodeService.get<Episode>(this.podcastID).subscribe(
      (response) => {
        const copyResponse: Episode[] = [...response];
        console.log('response', response);
        console.log('copyResponse', copyResponse[0].PosterName.includes("https://"));

        this.episodeList = response;
        this.episodeList.forEach((item) => {
          console.log('episode', item);
          item.PosterName = this.globalService.imageURL(item.PosterName);
          console.log('item.PosterName', item.PosterName);

          item.Created = new Date(item.Created).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          });
        });
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
              console.log('Deleted Episode', resp);
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
