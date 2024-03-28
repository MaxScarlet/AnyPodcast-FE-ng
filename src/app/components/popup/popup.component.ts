import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogLevel } from 'src/app/models/LogLevel';
import { Podcast } from 'src/app/models/Podcast';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  public podcastList: Podcast[] = [];
  public podcasts: Podcast[] = [];
  private userID: string = this.globalService.UserID;
  public isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupComponent>,
    private podcastService: PodcastService,
    public globalService: GlobalService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.podcastService.get<Podcast>(this.userID).subscribe(
      (response: Podcast[]) => {
        this.podcasts = response;
        this.podcastList = response.map((item) => {
          return {
            ...item,
            PosterName: this.globalService.imageURL(item.PosterName),
          };
        });
        this.isLoading = false;
      },
      (error) => {
        this.globalService.logWriter(
          'Error fetching episodes:',
          error,
          LogLevel.ERROR
        );
      }
    );
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  handleLIClick(_id: string): void {
    const podcast = this.podcasts.find((podcast) => podcast._id === _id);
    this.globalService.Podcast = podcast!;
    // this.globalService.Podcast._id = _id;
    this.globalService.updateAppVar('trigger'); // this.globalService.PodcastID
    this.cookieService.set('podcastID', this.globalService.PodcastID, {
      path: '/',
    });
    this.router.navigate([`/podcast/${this.globalService.PodcastID}/episode`]);
    this.closeDialog();
  }
}
