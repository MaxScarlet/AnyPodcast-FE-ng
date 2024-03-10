import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Upload } from 'src/app/models/Upload';
import { User } from 'src/app/models/User';
import { environment } from 'src/environment';

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
  private baseUrl = `${environment.fileMngUrl}/upload`;
  constructor(private http: HttpClient) {}

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
    };

    const options = {
      headers: this.headers,
      reportProgress: true,
    };

    this.http.post<any>(`${this.baseUrl}/init`, upload, options).subscribe(
      (upload: Upload) => {
        console.log('Response(init): ', upload);
        upload = upload; 

        let uploadedPartsCnt = 0;
        const uploadedParts: any[] = [];

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
                    const completePayload = {
                      UploadId: upload.UploadId,
                      Parts: uploadedParts,
                    };
                    this.http
                      .post<any>(`${this.baseUrl}/complete`, completePayload, {
                        headers: this.headers,
                      })
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
