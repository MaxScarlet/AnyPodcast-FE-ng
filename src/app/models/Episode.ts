export class Episode {
  _id!: string;
  Created!: string;
  IsVisible: boolean = false;
  PodcastID?: string;
  Title: string = "";
  Description: string = "";
  Scheduled!: string;
  UploadID!: string;
  PosterName: string = "";
  MediaFile!: string;
  MediaFileOriginal!: string;
}