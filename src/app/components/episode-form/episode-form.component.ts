import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';
import { Location } from '@angular/common';
import { User } from 'src/app/models/User';

type EpisodeApiResponse = {
  _id: string;
  Created: string;
  IsVisible: boolean;
  PodcastID?: string;
  Title: string;
  Description: string;
  Scheduled: string;
};

type EpisodeFormModel = Omit<EpisodeApiResponse, 'Created' | '_id'>;

@Component({
  selector: 'app-episode-form',
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.css'],
})
export class EpisodeFormComponent {
  private _id: string = '';
  userObj: User = new User();

  toggleText: string = 'Unpublished';

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
  };

  ngOnInit(): void {
    console.log('onInit episode form');

    this.route.params.subscribe((params) => {
      console.log(params);
      this._id = params['episodeID'];
      console.log('episode form _id', this._id);

      this.userObj.UserId = this.globalService.UserID;
      this.userObj.PodcastId = this.globalService.PodcastID;
      this.userObj.EpisodeId = this._id;

      if (this._id) {
        this.getEpisode();
      }
    });
  }

  visibleToggle(isChecked: boolean): void {
    this.formData.IsVisible = isChecked;
    console.log(isChecked);
  }

  getEpisode() {
    this.episodeService.getByID<EpisodeFormModel>(this._id).subscribe(
      (response) => {
        this.formData.Title = response.Title;
        this.formData.Description = response.Description;
        this.formData.IsVisible = response.IsVisible;
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }

  onSubmit() {
    let observable: Observable<EpisodeFormModel>;
    if (!this._id) {
      this.formData.PodcastID = this.globalService.PodcastID;
      observable = this.episodeService.create<EpisodeFormModel>(this.formData);
    } else {
      const { PodcastID, ...formDataWithoutPodcastID } = this.formData;
      console.log(this.formData);

      observable = this.episodeService.update<EpisodeFormModel>(
        formDataWithoutPodcastID,
        this._id
      );
    }
    observable.subscribe(
      (response) => {
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
