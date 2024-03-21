import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { Observable } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { Podcast } from 'src/app/models/Podcast';

@Component({
  selector: 'app-podcast-info',
  templateUrl: './podcast-info.component.html',
  styleUrls: ['./podcast-info.component.css'],
})
export class PodcastInfoComponent {
  constructor(
    private route: ActivatedRoute,
    public globalService: GlobalService,
    private popupService: PopupService,
    private podcastService: PodcastService,
    private router: Router
  ) {}
  private _id: string = '';
  @ViewChild(ImageUploadComponent) imageUploadComponent!: ImageUploadComponent;

  userObj: User = new User();
  msgText: string = '';

  public formData: Podcast = new Podcast();

  //TODO: Add notification if you leave the page without uploading/submitting

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userObj.UserId = this.globalService.UserID;
      this.userObj.PodcastId = this.globalService.PodcastID;
      this.formData.PosterName = this.globalService.defaultPosterName();
      console.log('UserOBJ', this.userObj);

      if (this.router.url.includes('create')) {
        this._id = '';
      } else {
        this._id = this.globalService.PodcastID;
        if (this._id) {
          this.getPodcast();
        }
      }
    });
  }

  visibleToggle(isChecked: boolean): void {
    this.formData.IsVisible = isChecked;
    console.log(isChecked);
  }

  imageUploadStart() {
    console.log('imageUploadStart');
  }

  imageUploadComplete(fileName: string): void {
    if (fileName) {
      this.formData.PosterName = fileName;
    }
    console.log('imageUploadComplete', fileName);
    this.updatePodcast();
    this.msgText = "Image Upload Complete"
  }

  getPodcast() {
    this.podcastService.getByID<Podcast>(this._id).subscribe(
      (response) => {
        this.formData = response;
        console.log('formData', this.formData);
      },
      (error) => {
        console.error('Error fetching podcast:', error);
      }
    );
  }

  onSubmit() {
    console.log('onSubmit');
    if (!this.formData._id) {
      console.log('Create new podcast');
      this.createPodcast();
    } else {
      console.log('onUploadInit');
      this.imageUploadComponent.onUploadInit();
    }
  }

  createPodcast() {
    this.formData.UserID = this.globalService.UserID;
    this.podcastService.create<Podcast>(this.formData).subscribe(
      (response: Podcast) => {
        console.log('response', response);
        this.globalService.Podcast = response;
        this.userObj.PodcastId = response._id;

        this.formData = response;
        this.imageUploadComponent.onUploadInit();
      },
      (error) => {
        console.error('Error handling podcast: ', error);
      }
    );
  }

  updatePodcast() {
    const { UserID, _id, ...updateFormData } = this.formData;
    console.log('Update Podcast', updateFormData);

    this.podcastService
      .update<Podcast>(updateFormData, this.formData._id)
      .subscribe(
        (response: Podcast) => {
          console.log('response', response);
          this.globalService.Podcast = response;
          this.router.navigate([
            `/podcast/${this.globalService.PodcastID}/episode`,
          ]);
        },
        (error) => {
          console.error('Error handling podcast: ', error);
        }
      );
  }
}
