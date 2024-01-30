import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-podcast-info',
  templateUrl: './podcast-info.component.html',
  styleUrls: ['./podcast-info.component.css'],
})
export class PodcastInfoComponent {
  constructor(
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private popupService: PopupService,
    private podcastService: PodcastService,
    private router: Router
  ) {}
  private _id: string = '';

  public formData: any = {
    UserID: '',
    IsVisible: false,
    Title: '',
    Description: '',
  };

  ngOnInit(): void {
    if (this.router.url.includes('create')) {
      this._id = '';
    } else {
      this._id = this.globalService.PodcastID;
      if (this._id) {
        this.getPodcast();
      }
    }
  }

  getPodcast() {
    this.podcastService.getByID<any>(this._id).subscribe(
      (response) => {
        this.formData.Title = response.Title;
        this.formData.Description = response.Description;
      },
      (error) => {
        console.error('Error fetching podcast:', error);
      }
    );
  }

  onSubmit() {
    let observable: Observable<any>;
    if (!this._id) {
      this.formData.UserID = this.globalService.UserID;
      observable = this.podcastService.create<any>(this.formData);
    } else {
      const { UserID, ...updateFormData } = this.formData;
      observable = this.podcastService.update<any>(updateFormData, this._id);
    }

    observable.subscribe(
      (response) => {
        if (this.router.url.includes('create')) {
          this.globalService.PodcastID = response._id;
          this.router.navigate([
            `/podcast/${this.globalService.PodcastID}/episode`,
          ]);
        } else {
          this.router.navigate(['dashboard']);
        }
      },
      (error) => {
        console.error('Error handling podcast: ', error);
      }
    );
  }

  //   openMessage() {
  //     this.popupService
  //       .openPopup({
  //         title: 'Create podcast',
  //         message: `Podcast "${this.formData.Title}" created successfully`,
  //         confirmButtonText: 'Ok',
  //       })
  //       .subscribe((result) => {
  //         if (result) {
  //           this.router.navigate(['podcast-info']);
  //         }
  //       });
  //   }
}
