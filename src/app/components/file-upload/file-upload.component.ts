import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Upload } from 'src/app/models/Upload';
import { User } from 'src/app/models/User';
import { FileMngService } from 'src/app/services/file-mng.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  @Input() user: User = new User();
  @Output() uploadFileName = new EventEmitter<string>();
  @Output() uploadStarted = new EventEmitter<string>();

  selectedFile: File | null = null;
  uploadProgress: number = 0;
  constructor(
    private http: HttpClient,
    private fileMngService: FileMngService
  ) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  onFileSelected(event: any): void {
    console.log('user', this.user);
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
    this.onUploadInit();
  }

  onFileDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFile = event.dataTransfer.files[0];
    this.onUploadInit();
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    event.target.classList.add('drag-over');
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('drag-over');
  }

  onUploadInit(): void {
    console.log('user', this.user);

    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }
    this.uploadStarted.emit(this.selectedFile?.name);

    const partSize = 5 * 1024 * 1024; // min 5 MB part size
    const totalParts = Math.ceil(this.selectedFile.size / partSize);

    let upload: Upload = {
      FileName: this.selectedFile.name,
      User: this.user,
      TotalParts: totalParts,
      Size: this.selectedFile.size,
      ContentType: `${this.selectedFile.type}`,
    };

    this.fileMngService.init(upload).subscribe(
      (upload: Upload) => {
        console.log('Response(init): ', upload);
        upload = upload;

        let uploadedPartsCnt = 0;
        const uploadedParts: any[] = [];
        console.log('this.selectedFile?.type', this.selectedFile?.type);

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          const start = (partNumber - 1) * partSize;
          const end = Math.min(partNumber * partSize, this.selectedFile!.size);
          const filePart = this.selectedFile!.slice(start, end);
          const part = upload.Parts![partNumber - 1];

          this.http
            .put(part.PresignedUrl, filePart, {
              observe: 'response',
              reportProgress: true,
            })
            .subscribe(
              (response) => {
                if (response.status === 200 || response.status === 204) {
                  console.log('Part uploaded to S3', response);
                  uploadedPartsCnt++;

                  this.uploadProgress = Math.round(
                    (uploadedPartsCnt / totalParts) * 100
                  );
                  console.log('progress', this.uploadProgress);

                  const eTag = response.headers.get('ETag')?.replace(/"/g, '');
                  uploadedParts.push({ PartNumber: partNumber, ETag: eTag });

                  if (uploadedPartsCnt === totalParts) {
                    this.fileMngService
                      .complete(upload, uploadedParts)
                      .subscribe(
                        (completeResponse) => {
                          console.log(
                            'Multipart upload completed successfully',
                            completeResponse
                          );
                          this.uploadFileName.emit(completeResponse.FileName);
                        },
                        (error) => {
                          console.error(
                            'Error completing multipart upload',
                            error
                          );
                        }
                      );
                  }
                } else {
                  console.error(
                    `Failed to upload part: HTTP ${response.status}`
                  );
                }
              },
              (error) => {
                console.error('Error uploading part to S3', error);
              }
            );
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error initiating multipart upload', error);
      }
    );
  }
}
