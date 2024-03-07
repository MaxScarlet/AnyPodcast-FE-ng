// episodes.component.ts

import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { PopupService } from 'src/app/services/popup.service';
import { EpisodeService } from '../../services/episode.service';
import { Episode } from 'src/app/models/Episode';

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

  constructor(
    private episodeService: EpisodeService,
    public globalService: GlobalService,
    public dialog: MatDialog,
    private popupService: PopupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('Episodes Constructor');
    this.subscription = this.globalService.appVar$.subscribe((value) => {
      console.log('appVar$.subscribe');
      this.ngOnInit();
    });
  }

  async ngOnInit() {
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

  fetchEpisodes(): void {
    this.isLoading = true;
    this.episodeService.get<Episode>(this.podcastID).subscribe(
      (response) => {
        this.episodeList = response;
        this.episodeList.forEach((item) => {
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
          this.deleteEpisode(episode._id);
        }
      });
  }

  deleteEpisode(id: string): void {
    this.episodeService.delete(id).subscribe(
      (response) => {
        this.fetchEpisodes();
      },
      (error) => {
        console.error('Failed to delete episodes', error);
      }
    );
  }
}
