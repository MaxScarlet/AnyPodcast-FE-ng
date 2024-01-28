import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PopupService } from 'src/app/services/popup.service';

type EpisodeApiResponse = {
  _id: string;
  Created: string;
  IsVisible: boolean;
  PodcastID?: string;
  Title: string;
  Description: string;
};

type EpisodeFormModel = Omit<EpisodeApiResponse, 'Created' | '_id'>;

@Component({
  selector: 'app-episode-form',
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.css'],
})
export class EpisodeFormComponent {
  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    private router: Router,
    private popupService: PopupService
  ) {}

  private _id: string = '';

  public formData: EpisodeFormModel = {
    PodcastID: '',
    IsVisible: false,
    Title: '',
    Description: '',
  };

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this._id = params['_id'];
      if (this._id) {
        this.getValues();
      }
    });
  }

  getValues() {
    this.episodeService.getByID<EpisodeFormModel>(this._id).subscribe(
      (response) => {
        this.formData.Title = response.Title;
        this.formData.Description = response.Description;
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
      observable = this.episodeService.postEpisode<EpisodeFormModel>(
        this.formData
      );
    } else {
      const { PodcastID, ...formDataWithoutPodcastID } = this.formData;
      observable = this.episodeService.updateEpisode<EpisodeFormModel>(
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
          this.router.navigate(['episodes']);
        }
      });
  }
}
