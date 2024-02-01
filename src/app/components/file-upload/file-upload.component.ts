import { Component } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  uploadProgress: number | undefined;
  baseUrl = 'https://9q4yvdedcj.execute-api.il-central-1.amazonaws.com/stg';

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  onUploadInit(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      // Show a popup or provide user feedback
      return;
    }

    const fileName = this.selectedFile.name;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Set the content type based on your API's requirements
    });

    const options = {
      headers: headers,
      params: {
        fileName: fileName,
      },
      reportProgress: true,
    };

    const uploadUrl = `${this.baseUrl}/init`; // Replace with your API endpoint

    // Use GET request to initiate multipart upload
    this.http.get<any>(uploadUrl, options).subscribe(
      (response) => {
        console.log('Response(init): ', response);
        const uploadId = response.uploadId;
        this.uploadParts(uploadId);
      },
      (error: HttpErrorResponse) => {
        console.error('Error initiating multipart upload', error);
        // Handle error, show error message to the user, etc.
      }
    );
  }
  uploadParts(uploadId: string): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const partSize = 0.5 * 1024 * 1024; // 5 MB part size (adjust as needed)
    const totalParts = Math.ceil(this.selectedFile.size / partSize);
    let uploadedParts = 0;

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(partNumber * partSize, this.selectedFile.size);

      const filePart = this.selectedFile.slice(start, end);
      const formData = new FormData();
      formData.append('file', filePart);

      const headers = new HttpHeaders();
      headers.set('Content-Type', 'multipart/form-data');

      const options = {
        headers: headers,
        params: {
          uploadId: uploadId,
          partNumber: partNumber.toString(),
        },
        reportProgress: true,
      };

      const uploadUrl = `${this.baseUrl}/upload`; // Replace with your API endpoint

      this.http.post<any>(uploadUrl, formData, options).subscribe(
        (event: HttpEvent<any>) => {
          console.log('Response(uploadParts): ', event);

          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(
              (event.loaded / event.total!) * 100
            );
          } else if (event.type === HttpEventType.Response) {
            uploadedParts++;
            
            if (uploadedParts === totalParts) {
              this.uploadComplete(uploadId);
            }
          }
        },
        (error) => {
          console.error('Error uploading file part', error);
        }
      );
    }
  }

  uploadComplete(uploadId: string): void {
    const completeUrl = `${this.baseUrl}/complete`; // Replace with your API endpoint

    this.http.post<any>(completeUrl, { uploadId }).subscribe(
      (response) => {
        console.log('Response(uploadComplete): ', response);
        console.log('Multipart upload completed successfully', response);
        this.uploadProgress = undefined;
      },
      (error) => {
        console.error('Error completing multipart upload', error);
        this.uploadProgress = undefined;
      }
    );
  }
}
