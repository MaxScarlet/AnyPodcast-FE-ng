import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LogLevel } from 'src/app/models/LogLevel';

import { Upload } from 'src/app/models/Upload';
import { User } from 'src/app/models/User';
import { FileMngService } from 'src/app/services/file-mng.service';
import { GlobalService } from 'src/app/services/global.service';

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
    private fileMngService: FileMngService,
    private globalService: GlobalService
  ) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  onFileSelected(event: any): void {
    this.globalService.logWriter('user', this.user, LogLevel.DEBUG);
    this.selectedFile = event.target.files[0];
    this.globalService.logWriter(
      'Selected File',
      this.selectedFile as File,
      LogLevel.DEBUG
    );
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
    this.globalService.logWriter('user', this.user, LogLevel.DEBUG);

    if (!this.selectedFile) {
      this.globalService.logWriter('No file selected', LogLevel.DEBUG);
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
        this.globalService.logWriter(
          'Response(init): ',
          upload,
          LogLevel.DEBUG
        );
        upload = upload;

        let uploadedPartsCnt = 0;
        const uploadedParts: any[] = [];
        this.globalService.logWriter(
          'this.selectedFile?.type',
          this.selectedFile?.type,
          LogLevel.DEBUG
        );

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
                  this.globalService.logWriter(
                    'Part uploaded to S3',
                    response,
                    LogLevel.DEBUG
                  );
                  uploadedPartsCnt++;

                  this.uploadProgress = Math.round(
                    (uploadedPartsCnt / totalParts) * 100
                  );
                  this.globalService.logWriter(
                    'progress',
                    this.uploadProgress,
                    LogLevel.DEBUG
                  );

                  const eTag = response.headers.get('ETag')?.replace(/"/g, '');
                  uploadedParts.push({ PartNumber: partNumber, ETag: eTag });

                  if (uploadedPartsCnt === totalParts) {
                    this.fileMngService
                      .complete(upload, uploadedParts)
                      .subscribe(
                        (completeResponse) => {
                          this.globalService.logWriter(
                            'Multipart upload completed successfully',
                            completeResponse,
                            LogLevel.DEBUG
                          );
                          this.uploadFileName.emit(completeResponse.FileName);
                        },
                        (error) => {
                          this.globalService.logWriter(
                            'Error completing multipart upload',
                            error,
                            LogLevel.ERROR
                          );
                        }
                      );
                  }
                } else {
                  this.globalService.logWriter(
                    `Failed to upload part:`,
                    response.status,
                    LogLevel.ERROR
                  );
                }
              },
              (error) => {
                this.globalService.logWriter(
                  'Error uploading part to S3',
                  error,
                  LogLevel.ERROR
                );
              }
            );
        }
      },
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
