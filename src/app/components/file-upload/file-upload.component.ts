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
  uploadProgress: number | undefined;
  private baseUrl = `${environment.fileMngUrl}/upload`;
  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  onFileSelected(event: any): void {
    console.log('user', this.user);
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  onUploadInit(): void {
    console.log('user', this.user);

    if (!this.selectedFile) {
      console.error('No file selected');
      // Show a popup or provide user feedback
      return;
    }
    this.uploadStarted.emit(this.selectedFile?.name);

    const partSize = 5 * 1024 * 1024; // min 5 MB part size (adjust as needed)
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
        upload = upload; // response should include pre-signed URLs and UploadId

        let uploadedPartsCnt = 0;
        const uploadedParts: any[] = [];

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          const start = (partNumber - 1) * partSize;
          const end = Math.min(partNumber * partSize, this.selectedFile!.size);
          const filePart = this.selectedFile!.slice(start, end);
          const part = upload.Parts![partNumber - 1]; // Retrieve pre-signed URL for this part

          this.http
            .put(part.PresignedUrl, filePart, {
              observe: 'response',
              reportProgress: true,
            })
            .subscribe(
              (response) => {
                if (response.status === 200 || response.status === 204) {
                  console.log('Part uploaded to S3', response);
                  this.uploadProgress = Math.round(
                    (partNumber / totalParts) * 100
                  );

                  uploadedPartsCnt++;
                  // Extract ETag header from the response, and remove quotes
                  const eTag = response.headers.get('ETag')?.replace(/"/g, '');
                  uploadedParts.push({ PartNumber: partNumber, ETag: eTag });

                  if (uploadedPartsCnt === totalParts) {
                    // Prepare the complete request including the UploadId and parts info
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
                          this.uploadProgress = undefined;
                          this.uploadFileName.emit(completeResponse.FileName);
                        },
                        (error) => {
                          console.error(
                            'Error completing multipart upload',
                            error
                          );
                          this.uploadProgress = undefined;
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

          // this.http.put(part.PresignedUrl, filePart, { reportProgress: true }).subscribe(
          //   (partResponse: any) => {
          //     console.log('Part uploaded to S3', partResponse);
          //     this.uploadProgress = Math.round((partNumber / totalParts) * 100);

          //     uploadedPartsCnt++;
          //     // Collect part info as required by S3 to complete the upload, typically partNumber and ETag
          //     uploadedParts.push({ PartNumber: partNumber, ETag: partResponse.headers.get('ETag') });

          //     if (uploadedPartsCnt === totalParts) {
          //       // Prepare the complete request including the UploadId and parts info
          //       const completePayload = { UploadId: upload.UploadId, Parts: uploadedParts };
          //       this.http.post<any>(`${this.baseUrl}/complete`, completePayload, { headers: this.headers }).subscribe(
          //         (completeResponse) => {
          //           console.log('Multipart upload completed successfully', completeResponse);
          //           this.uploadProgress = undefined;
          //         },
          //         (error) => {
          //           console.error('Error completing multipart upload', error);
          //           this.uploadProgress = undefined;
          //         }
          //       );
          //     }
          //   },
          //   (error) => {
          //     console.error('Error uploading part to S3', error);
          //   }
          // );
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error initiating multipart upload', error);
      }
    );
    // this.http.post<any>(`${this.baseUrl}/init`, upload, options).subscribe(
    //   (response) => {
    //     console.log('Response(init): ', response);
    //     upload = response;
    //     if (!this.selectedFile) {
    //       console.error('No file selected');
    //       return;
    //     }

    //     let uploadedPartsCnt = 0;
    //     const uploadedParts: any[] = [];

    //     for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    //       const start = (partNumber - 1) * partSize;
    //       const end = Math.min(partNumber * partSize, this.selectedFile.size);

    //       const filePart = this.selectedFile.slice(start, end);
    //       const formData = new FormData();
    //       formData.append('file', filePart);

    //       const headers = new HttpHeaders();
    //       headers.set('Content-Type', 'multipart/form-data');

    //       const options = {
    //         headers: headers,
    //         params: {
    //           UploadId: upload.UploadId!,
    //           PartNumber: partNumber.toString(),
    //         },
    //         reportProgress: true,
    //       };

    //       this.http.post<any>(`${this.baseUrl}/upload`, formData, options).subscribe(
    //         (part: Part) => {
    //           console.log('Response (uploadPart): ', part);

    //           this.uploadProgress = Math.round((partNumber/totalParts) * 100);

    //           uploadedPartsCnt++;
    //           uploadedParts.push(part);

    //           console.log("uploadedPartsCnt", uploadedPartsCnt);
    //           console.log("uploadedParts", uploadedParts);

    //           if (uploadedPartsCnt === totalParts) {
    //             upload.Parts = uploadedParts;
    //             this.http.post<any>(`${this.baseUrl}/complete`, upload, { headers: this.headers }).subscribe(
    //               (response) => {
    //                 console.log('Response(uploadComplete): ', response);
    //                 console.log('Multipart upload completed successfully', response);
    //                 this.uploadProgress = undefined;
    //               },
    //               (error) => {
    //                 console.error('Error completing multipart upload', error);
    //                 this.uploadProgress = undefined;
    //               }
    //             );
    //           }
    //         },
    //         (error) => {
    //           console.error('Error uploading file part', error);
    //         }
    //       );
    //     }
    //   },
    //   (error: HttpErrorResponse) => {
    //     console.error('Error initiating multipart upload', error);
    //   }
    // );
  }
}
