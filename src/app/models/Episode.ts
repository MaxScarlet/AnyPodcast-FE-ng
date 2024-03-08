export class Episode {
  _id!: string;
  Created!: string;
  IsVisible: boolean = false;
  PodcastID?: string;
  Title: string = 'Untitled Episode';
  Description: string = 'Unknown Description';
  Scheduled!: string;
  UploadID!: string;
  PosterName: string = '';
  MediaFile!: string;
  MediaFileOriginal!: string;
}