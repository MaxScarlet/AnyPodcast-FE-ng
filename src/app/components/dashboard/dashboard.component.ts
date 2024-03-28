import { Component } from '@angular/core';
import { LogLevel } from 'src/app/models/LogLevel';
import { Podcast } from 'src/app/models/Podcast';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public podcastList: any[] = [];
  private userID: string = this.globalService.UserID;

  constructor(
    private podcastService: PodcastService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.userID = this.globalService.UserID;
    this.fetchPodcasts();
  }

  fetchPodcasts(): void {
    this.podcastService.get<Podcast>(this.userID).subscribe(
      (response) => {
        this.podcastList = response;
        this.podcastList.forEach((item: Podcast) => {
          item.EpisodeCount = Math.floor(Math.random() * 10);
          item.PosterName = this.globalService.imageURL(item.PosterName);
          item.Created = new Date(item.Created).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          });
        });
        this.podcastList.reverse();
      },
      (error) => {
        this.globalService.logWriter('Error fetching episodes:', error , LogLevel.ERROR);
      }
    );
  }
}
