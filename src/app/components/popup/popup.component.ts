// popup.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  public podcastList: any[] = [];
  private userID: string = this.globalService.UserID;

  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private podcastService: PodcastService,
    private globalService: GlobalService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.podcastService.get<any>(this.userID).subscribe(
      (response) => {
        GlobalService;
        this.podcastList = response;
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
    this.globalService.PodcastID = _id;
    this.cookieService.set('podcastID', this.globalService.PodcastID);
    this.router.navigate(['/episodes']);
    this.closeDialog();
  }
}