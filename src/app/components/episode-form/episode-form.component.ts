import { Component, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';
import { Location } from '@angular/common';
import { User } from 'src/app/models/User';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { Episode } from 'src/app/models/Episode';

@Component({
  selector: 'app-episode-form',
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.css'],
})
export class EpisodeFormComponent {
  private _id: string = '';
  @ViewChild(ImageUploadComponent) imageUploadComponent!: ImageUploadComponent;
  userObj: User = new User();
  isUploadInProgress: boolean = false;
  toggleText: string = 'Unpublished';
  public isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    private router: Router,
    private popupService: PopupService
  ) {}

  public formData: Episode = new Episode()

  ngOnInit(): void {
    console.log('onInit episode form');
    console.log('ngOnInit', this.isUploadInProgress);

    this.route.params.subscribe((params) => {
      console.log('params', params);
      this._id = params['episodeID'];
      console.log('episode form _id', this._id);

      this.userObj.UserId = this.globalService.UserID;
      this.userObj.PodcastId = this.globalService.PodcastID;
      this.userObj.EpisodeId = this._id;
      console.log('UserOBJ', this.userObj);

      if (this._id) {
        console.log('get episode');
        this.getEpisode();
      } else {
        console.log('create episode');
        this.createEpisode();
      }
    });
  }

  uploadComplete(fileName: string): void {
    this.formData.MediaFile = fileName;
    this.isUploadInProgress = false;
    console.log('uploadComplete', this.isUploadInProgress);
  }

  uploadInProgress(fileNameOriginal: string): void {
    this.isUploadInProgress = true;
    this.formData.MediaFileOriginal = fileNameOriginal;
    console.log('uploadInProgress', this.isUploadInProgress);
  }

  imageUploadStart() {
    console.log('imageUploadStart');
  }

  imageUploadComplete(fileName: string): void {
    this.formData.PosterName = fileName;
    console.log('imageUploadComplete', this.isUploadInProgress);
    this.updateEpisode();
  }

  visibleToggle(isChecked: boolean): void {
    this.formData.IsVisible = isChecked;
    console.log(isChecked);
  }

  getEpisode() {
    this.episodeService.getByID<Episode>(this._id).subscribe(
      (response) => {
        this.formData = response;
        console.log(this.formData);
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }

  createEpisode() {
    let observable: Observable<Episode>;
    this.formData.PodcastID = this.globalService.PodcastID;
    observable = this.episodeService.create<Episode>(this.formData);
    observable.subscribe(
      (response: Episode) => {
        this.router.navigate([
          `/podcast/${this.globalService.PodcastID}/episode/${response._id}`,
        ]);
      },
      (error) => {
        console.error('Error handling episode: ', error);
      }
    );
  }

  onSubmit() {
    console.log('onSubmit');
    this.imageUploadComponent.onUploadInit();
  }

  updateEpisode() {
    const { PodcastID, ...formDataWithoutPodcastID } = this.formData;
    console.log('onSubmit formData', this.formData);

    this.episodeService
      .update<Episode>(formDataWithoutPodcastID, this._id)
      .subscribe(
        (response: Episode) => {
          //TODO: rename file in s3 bucket
          this.openMessage();
        },
        (error) => {
          console.error('Error handling episode: ', error);
        }
      );
  }

  openMessage() {
    this.popupService
      .openPopup({
        title: 'Create episode',
        message: `Episode "${this.formData.Title}" created successfully`,
        confirmButtonText: 'Ok',
      })
      .subscribe((result) => {
        if (result) {
          this.router.navigate([
            `/podcast/${this.globalService.PodcastID}/episode`,
          ]);
        }
      });
  }
}
