// episodes.component.ts

import { Component, OnInit } from '@angular/core';
import { EpisodeService } from '../../services/episode.service';
import { GlobalService } from 'src/app/services/global.service';

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
    private globalService: GlobalService
  ) {}
  ngOnInit(): void {
    this.podcastID = this.globalService.PodcastID;
    this.fetchEpisodes();
  }
  fetchEpisodes(): void {
    this.episodeService.get<any[]>(this.podcastID).subscribe(
      (response) => {
        this.episodeList = response;
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }
}
