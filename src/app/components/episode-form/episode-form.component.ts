import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeService } from 'src/app/services/episode.service';

type EpisodeApiResponse = {
  _id: string;
  Created: string;
  IsVisible: boolean;
  PodcastID: string;
  Title: string;
  Description: string;
};

type EpisodeFormModel = Omit<EpisodeApiResponse, 'Created' | 'PodcastID'>;

@Component({
  selector: 'app-episode-form',
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.css'],
})
export class EpisodeFormComponent {
  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService
  ) {}

  private _id: string = '';

  public formData: EpisodeFormModel = {
    _id: '',
    IsVisible: false,
    Title: '',
    Description: '',
  };

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this._id = params['_id'];
      this.getValues();
    });
  }

  getValues() {
    this.episodeService.getByID<EpisodeFormModel>(this._id).subscribe(
      (response) => {
        // this.formData = response as EpisodeFormModel;
        this.formData.Title = response.Title;
        this.formData.Description = response.Description;
      },
      (error) => {
        console.error('Error fetching episodes:', error);
      }
    );
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
  }
}
