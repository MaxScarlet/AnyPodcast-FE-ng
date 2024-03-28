import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LogLevel } from 'src/app/models/LogLevel';

import { Upload } from 'src/app/models/Upload';
import { User } from 'src/app/models/User';
import { FileMngService } from 'src/app/services/file-mng.service';
import { GlobalService } from 'src/app/services/global.service';
import { environment } from 'src/environment';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
})
export class ImageUploadComponent {
  @Input() user: User = new User();
  @Input() previewURL!: string;
  @Output() uploadComplete = new EventEmitter<string>();
  @Output() uploadStarted = new EventEmitter<string>();
  @Output() imageChanged = new EventEmitter<string>();

  selectedFile: File | null = null;
  uploadProgress: number | undefined;
  //   private baseUrl = `${environment.fileMngUrl}/upload`;
  public previewImageUrl: string = '';

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private fileMngService: FileMngService
  ) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  getImageUrl(): string {
    if (this.previewImageUrl) {
      return this.previewImageUrl;
    }
    return this.globalService.imageURL(this.previewURL);
  }

  onFileSelected(event: any): void {
    this.globalService.logWriter('user', this.user);
    this.globalService.logWriter('selectedFile', this.selectedFile);
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
              this.imageChanged.emit();
            } else {
              this.globalService.logWriter(
                'The selected file is not a valid image.',
                '',
                LogLevel.ERROR
              );
              target.value = '';
              this.previewImageUrl = '';
            }
          };
        };

        reader.readAsDataURL(file);
      }
    }
  }

  onUploadInit(): void {
    this.globalService.logWriter('user', this.user, LogLevel.DEBUG);

    if (!this.selectedFile) {
      this.globalService.logWriter('No file selected', '', LogLevel.WARN);
      this.uploadComplete.emit();
    } else {
      this.uploadStarted.emit(this.selectedFile?.name);

      let upload: Upload = {
        FileName: this.selectedFile.name,
        User: this.user,
        Size: this.selectedFile.size,
      };
      this.globalService.logWriter('Upload', upload, LogLevel.DEBUG);

      this.fileMngService.upload(upload).subscribe(
        (uploadResp: Upload) => this.apiHandlerUpload(uploadResp),
        (error: HttpErrorResponse) => {
          this.globalService.logWriter(
            'Error initiating multipart upload',
            error,
            LogLevel.ERROR
          );
        }
      );
    }
  }

  private apiHandlerUpload(uploadResp: Upload) {
    this.globalService.logWriter('Response(upload) POST: ', uploadResp);
    if (uploadResp && uploadResp.Parts) {
      const presignedUrl = uploadResp.Parts[0].PresignedUrl;

      const modifiedFile = new File([this.selectedFile!], uploadResp.FileName, {
        type: this.selectedFile!.type,
      });
      this.globalService.logWriter('Modified file: ', modifiedFile);

      this.http
        .put(presignedUrl, modifiedFile, {
          observe: 'events',
          headers: new HttpHeaders({
            'Content-Type': `${modifiedFile.type}`,
          }),
          reportProgress: true,
        })
        .subscribe(
          (event) => this.presignedURLHandler(event, uploadResp),
          (error) => {
            this.globalService.logWriter(
              'Error uploading image to S3',
              error,
              LogLevel.ERROR
            );
          }
        );
    }
  }

  private presignedURLHandler(event: any, uploadResp: Upload) {
    this.globalService.logWriter('Presigned URL');

    if (event.type === HttpEventType.UploadProgress) {
      this.uploadProgress = Math.round((100 * event.loaded) / event.total!);
    } else if (event instanceof HttpResponse) {
      this.uploadProgress = undefined;
      this.globalService.logWriter('completed successfully', uploadResp);
      this.uploadComplete.emit(uploadResp.FileName);
    }
  }
}
