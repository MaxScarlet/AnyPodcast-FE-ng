import { Component } from '@angular/core';
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
    private globalService: GlobalService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.userID = this.globalService.UserID;
    this.fetchPodcasts();
  }

  fetchPodcasts(): void {
    this.podcastService.get<any>(this.userID).subscribe(
      (response) => {
        this.podcastList = response;
        this.podcastList.forEach((item) => {
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
        console.error('Error fetching episodes:', error);
      }
    );
  }
  openPrompt(podcast: any) {
    this.popupService
      .openPopup({
        title: 'Delete Episode',
        message: `Are you sure you want to delete "${podcast.Title}"`,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      })
      .subscribe((result) => {
        if (result) {
          this.deleteEpisode(podcast._id);
        }
      });
  }
  deleteEpisode(id: string): void {
    this.podcastService.delete(id).subscribe(
      (response) => {
        this.fetchPodcasts();
      },
      (error) => {
        console.error('Failed to delete podcast', error);
      }
    );
  }
}
