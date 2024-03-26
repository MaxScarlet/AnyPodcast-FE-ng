import {
  Component,
  Input,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';
import { DatePipe, Location } from '@angular/common';
import { User } from 'src/app/models/User';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { Episode } from 'src/app/models/Episode';
import { LogLevel } from 'src/app/models/LogLevel';

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
  msgText: string = '';
  readonly unsavedMsgText: string = 'Unsaved data';
  isImageChanged: boolean = false;
  scheduledDate!: Date | null | string;
  scheduledTime!: null | string;
  public minDate = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
  private interval: number = 30;
  times: string[] = [];
  selectedTime: string = '00:00';

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    public globalService: GlobalService,
    private router: Router,
    private popupService: PopupService,
    private datePipe: DatePipe
  ) {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += this.interval) {
        this.times.push(
          `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`
        );
      }
    }
  }

  public formData: Episode = new Episode();

  ngOnInit(): void {
    this.globalService.logWriter('onInit episode form');
    this.globalService.logWriter('minDate: ', this.minDate);
    this.globalService.logWriter('ngOnInit', this.isUploadInProgress);

    this.route.params.subscribe((params) => {
      this.globalService.logWriter('params', params);
      this._id = params['episodeID'];
      this.globalService.logWriter('episode form _id', this._id);

      this.userObj.UserId = this.globalService.UserID;
      this.userObj.PodcastId = this.globalService.PodcastID;
      this.userObj.EpisodeId = this._id;
      this.globalService.logWriter('UserOBJ', this.userObj);

      if (this._id) {
        this.globalService.logWriter('get episode');
        this.getEpisode();
      } else {
        this.globalService.logWriter('create episode');
        this.createEpisode();
      }
    });
  }

  public get cantLeave(): boolean {
    return this.isUploadInProgress || this.isImageChanged;
  }

  isDisabled(time: string): boolean {
    const currentDateTime = new Date(`${this.scheduledDate} ${time}`);
    return currentDateTime < new Date();
  }

  onDateChanged(event: any): void {
    const selectedDate = new Date(event.target.value);
    if (selectedDate <= new Date()) {
      this.scheduledTime = this.getRoundTime(new Date());
    }
  }

  setScheduleDate(date?: any) {
    this.formData.IsVisible = false;
    if (date && typeof date === 'string') {
      date = new Date(date);
    }

    const currentDate = date ?? new Date();

    this.scheduledDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
    this.scheduledTime = this.getRoundTime(currentDate);
  }

  private getRoundTime(currentDate: Date) {
    const minutes = currentDate.getMinutes();
    const roundedMinutes = Math.ceil(minutes / this.interval) * this.interval;
    currentDate.setMinutes(roundedMinutes);
    return this.datePipe.transform(currentDate, 'HH:mm');
  }

  uploadComplete(fileName: string): void {
    this.formData.MediaFile = fileName;
    this.isUploadInProgress = false;
    this.globalService.logWriter('uploadComplete', this.isUploadInProgress);
    this.updateEpisode(this.formData);
  }

  //   @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    this.globalService.logWriter('cantLeave', this.cantLeave);

    if (this.cantLeave) {
      $event.returnValue = true;

      this.msgText = this.unsavedMsgText;
    }
  }

  uploadInProgress(fileNameOriginal: string): void {
    this.isUploadInProgress = true;
    this.formData.MediaFileOriginal = fileNameOriginal;
    this.globalService.logWriter('uploadInProgress', this.isUploadInProgress);
  }

  imageChanged() {
    this.isImageChanged = true;
    this.msgText = this.unsavedMsgText;
  }

  imageUploadStart() {
    this.globalService.logWriter('imageUploadStart');
  }

  imageUploadComplete(fileName: string): void {
    this.formData.PosterName = fileName;
    this.globalService.logWriter(
      'imageUploadComplete',
      this.isUploadInProgress
    );
    this.updateEpisode(this.formData);
  }

  visibleToggle(isChecked: boolean): void {
    this.formData.IsVisible = isChecked;
    this.globalService.logWriter(isChecked.toString());
  }

  getEpisode() {
    this.isLoading = true;
    this.episodeService.getByID<Episode>(this._id).subscribe(
      (response) => {
        this.formData = response;
        if (response.Scheduled) {
          this.setScheduleDate(response.Scheduled);
        }
        this.globalService.logWriter(
          'getEpisode formData',
          JSON.stringify(this.formData),
          LogLevel.DEBUG
        );
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
        this.globalService.logWriter(
          'Error creating episode: ',
          error,
          LogLevel.ERROR
        );
      }
    );
  }

  onSubmit() {
    this.globalService.logWriter('onSubmit');
    this.imageUploadComponent.onUploadInit();
  }

  public updateEpisode(episode: Episode) {
    if (this.scheduledDate && this.scheduledTime) {
      episode.Scheduled = new Date(
        `${this.scheduledDate} ${this.scheduledTime}`
      ).toISOString();
    }

    if (episode.IsVisible && episode.Scheduled) {
      episode.Scheduled = '';
    }

    const { PodcastID, ...formDataWithoutPodcastID } = episode;
    this.globalService.logWriter('onSubmit formData', episode);

    this.episodeService
      .update<Episode>(formDataWithoutPodcastID, this._id)
      .subscribe(
        (response: Episode) => {
          this.msgText = 'SAVED';
        },
        (error) => {
          this.globalService.logWriter(
            'Error handling episode: ',
            error,
            LogLevel.ERROR
          );
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
