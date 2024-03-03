import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Upload } from 'src/app/models/Upload';
import { User } from 'src/app/models/User';
import { environment } from 'src/environment';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
})
export class ImageUploadComponent {
  @Input() user: User = new User();
  @Input() previewURL!: string;
  @Output() uploadFileName = new EventEmitter<string>();
  @Output() uploadStarted = new EventEmitter<string>();

  selectedFile: File | null = null;
  uploadProgress: number | undefined;
  private baseUrl = `${environment.fileMngUrl}/upload`;
  public previewImageUrl: string = '';
  private readonly prefixForImage =
    'https://s3.il-central-1.amazonaws.com/web.il.oxymoron-tech.com/';
  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  test() {
    console.log('IMAGE upload test');
  }
  getImageUrl(): string {
    if (this.previewImageUrl) {
      return this.previewImageUrl;
    }
    return this.imageURL(this.previewURL);
  }

  imageURL(fileName: string) {
    return `${this.prefixForImage}${fileName}`;
  }

  onFileSelected(event: any): void {
    console.log('user', this.user);
    console.log(this.selectedFile);
  }

  handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
      const file = target.files[0];
      this.selectedFile = target?.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            if (img.width > 0 && img.height > 0) {
              this.previewImageUrl = event.target?.result as string;
            } else {
              alert('The selected file is not a valid image.');
              target.value = '';
              this.previewImageUrl = '';
            }
          };
        };

        reader.readAsDataURL(file);
        // TODO: integrate onUploadInit()
      }
    }
  }

  onUploadInit(): void {
    console.log('user', this.user);

    if (!this.selectedFile) {
      console.error('No file selected');
      // Show a popup or provide user feedback
      return;
    }
    this.uploadStarted.emit(this.selectedFile?.name);

    let upload: Upload = {
      FileName: this.selectedFile.name,
      User: this.user,
      Size: this.selectedFile.size,
    };

    const options = {
      headers: this.headers,
      reportProgress: true,
    };

    this.http.post<any>(`${this.baseUrl}`, upload, options).subscribe(
      (uploadResp: Upload) => this.apiHandlerUpload(uploadResp),
      (error: HttpErrorResponse) => {
        console.error('Error initiating multipart upload', error);
      }
    );
  }

  private apiHandlerUpload(uploadResp: Upload) {
    console.log('Response(upload) POST: ', uploadResp);
    if (uploadResp && uploadResp.Parts) {
      const presignedUrl = uploadResp.Parts[0].PresignedUrl;

      const modifiedFile = new File([this.selectedFile!], uploadResp.FileName, {
        type: this.selectedFile!.type,
      });

      this.http
        .put(presignedUrl, modifiedFile, {
          observe: 'events',
          headers: this.headers,
          reportProgress: true,
        })
        .subscribe(
          (event) => this.presignedURLHandler(event, uploadResp),
          (error) => {
            console.error('Error uploading image to S3', error);
          }
        );
    }
  }

  private presignedURLHandler(event: any, uploadResp: Upload) {
    if (event.type === HttpEventType.UploadProgress) {
      this.uploadProgress = Math.round((100 * event.loaded) / event.total!);
    } else if (event instanceof HttpResponse) {
      this.uploadProgress = undefined;
      this.uploadFileName.emit(uploadResp.FileName);
    }
  }
}
