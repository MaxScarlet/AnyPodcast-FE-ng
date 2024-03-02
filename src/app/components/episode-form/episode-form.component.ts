import { Component, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';
import { Location } from '@angular/common';
import { User } from 'src/app/models/User';

//TODO: Rewrite as a model
type EpisodeApiResponse = {
  _id: string;
  Created: string;
  IsVisible: boolean;
  PodcastID?: string;
  Title: string;
  Description: string;
  Scheduled: string;
  UploadID: string;
  PosterName: string;
  MediaFile: string;
  MediaFileOriginal: string;
};

type EpisodeFormModel = Omit<EpisodeApiResponse, 'Created' | '_id'>;

@Component({
  selector: 'app-episode-form',
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.css'],
})
export class EpisodeFormComponent {
  @Input() uploadFileName!: string;
  private _id: string = '';
  userObj: User = new User();
  upload: boolean = false;
  toggleText: string = 'Unpublished';
  public isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    private router: Router,
    private popupService: PopupService
  ) {}

  public formData: EpisodeFormModel = {
    PodcastID: '',
    IsVisible: false,
    Title: '',
    Description: '',
    Scheduled: '',
    UploadID: '',
    PosterName: '',
    MediaFile: '',
    MediaFileOriginal: '',
  };

  ngOnInit(): void {
    console.log('onInit episode form');
    console.log('ngOnInit', this.upload);

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
    this.upload = false;
    console.log('uploadComplete', this.upload);
  }

  uploadInProgress(fileNameOriginal: string): void {
    this.upload = true;
    this.formData.MediaFileOriginal = fileNameOriginal;
    console.log('uploadInProgress', this.upload);
  }

  imageUploadStart() {}
  imageUploadComplete(fileName: string): void {
    this.formData.PosterName = fileName;
    console.log('uploadComplete', this.upload);
  }

  visibleToggle(isChecked: boolean): void {
    this.formData.IsVisible = isChecked;
    console.log(isChecked);
  }

  getEpisode() {
    this.episodeService.getByID<EpisodeFormModel>(this._id).subscribe(
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
    let observable: Observable<EpisodeFormModel>;
    this.formData.PodcastID = this.globalService.PodcastID;
    observable = this.episodeService.create<EpisodeFormModel>(this.formData);
    observable.subscribe(
      (response: any) => {
        //TODO: rename file in s3 bucket
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
    let observable: Observable<EpisodeFormModel>;

    const { PodcastID, ...formDataWithoutPodcastID } = this.formData;
    console.log('onSubmit formData', this.formData);
    observable = this.episodeService.update<EpisodeFormModel>(
      formDataWithoutPodcastID,
      this._id
    );
    observable.subscribe(
      (response: any) => {
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
