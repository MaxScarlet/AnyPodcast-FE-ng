import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
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
  private userID: string = this.globalService.UserID;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupComponent>,
    private podcastService: PodcastService,
    public globalService: GlobalService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.podcastService.get<Podcast>(this.userID).subscribe(
      (response: Podcast[]) => {
        this.podcastList = response.map((item) => {
          return {
            ...item,
            PosterName: this.globalService.imageURL(item.PosterName),
          };
        });
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  handleLIClick(_id: string): void {
    this.globalService.Podcast._id = _id;
    this.cookieService.set('podcastID', this.globalService.PodcastID, {
      path: '/',
    });
    this.globalService.updateAppVar(this.globalService.PodcastID);
    this.router.navigate([`/podcast/${this.globalService.PodcastID}/episode`]);
    this.closeDialog();
  }
}
