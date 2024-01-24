// episodes.component.ts

import { Component, OnInit } from '@angular/core';
import { EpisodeService } from '../services/episode.service';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css'],
})
export class EpisodesComponent implements OnInit {
  episodeList: any[] = [];

  constructor(private episodeService: EpisodeService) {}

  ngOnInit(): void {
    this.fetchEpisodes();
  }

  fetchEpisodes(): void {

    this.episodeService.get<any[]>().subscribe(
      (response) => {
        console.log(response);

        this.episodeList = response;
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }
}
