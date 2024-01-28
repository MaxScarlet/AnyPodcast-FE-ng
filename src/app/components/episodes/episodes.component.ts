// episodes.component.ts

import { Component, OnInit } from '@angular/core';
import { EpisodeService } from '../../services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css'],
})
export class EpisodesComponent implements OnInit {
  episodeList: any[] = [];
  private podcastID: string = '';

  constructor(
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    public dialog: MatDialog,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.podcastID = this.globalService.PodcastID;
    this.fetchEpisodes();
  }

  fetchEpisodes(): void {
    this.episodeService.get<any[]>(this.podcastID).subscribe(
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
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }

  openPrompt(episode: any) {
    this.popupService
      .openPopup({
        title: 'Delete Episode',
        message: `Are you sure you want to delete "${episode.Title}"`,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      })
      .subscribe((result) => {
        if (result) {
          this.deleteEpisode(episode._id);
        }
      });
  }

  deleteEpisode(id: string): void {
    this.episodeService.deleteEpisode(id).subscribe(
      (response) => {
        this.fetchEpisodes();
      },
      (error) => {
        console.error('Failed to delete episodes', error);
      }
    );
  }
}
