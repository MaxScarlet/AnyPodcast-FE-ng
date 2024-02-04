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
  private baseUrl = 'https://9q4yvdedcj.execute-api.il-central-1.amazonaws.com/stg';
  // baseUrl = 'http://localhost:4063';

  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

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


    const options = {
      headers: this.headers,
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
        if (!this.selectedFile) {
          console.error('No file selected');
          return;
        }

        const partSize = 5 * 1024 * 1024; // 5 MB part size (adjust as needed)
        const totalParts = Math.ceil(this.selectedFile.size / partSize);
        let uploadedPartsCnt = 0;
        const uploadedParts: any[] = [];

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
              fileName: fileName,
              uploadId: uploadId,
              partNumber: partNumber.toString(),
            },
            reportProgress: true,
          };

          const uploadUrl = `${this.baseUrl}/upload`; // Replace with your API endpoint

          this.http.post<any>(uploadUrl, formData, options).subscribe(
            (eTagObj: any) => {
              console.log('Response(uploadParts): ', eTagObj);
              // TODO: reimplement
              // this.uploadProgress = Math.round( (eTagObj.loaded / eTagObj.total!) * 100  );

              uploadedPartsCnt++;
              uploadedParts.push(eTagObj.resp);

              console.log("uploadedPartsCnt", uploadedPartsCnt);
              console.log("uploadedParts", uploadedParts);

              if (uploadedPartsCnt === totalParts) {
                this.uploadComplete(fileName, uploadId, uploadedParts);
              }
            },
            (error) => {
              console.error('Error uploading file part', error);
            }
          );
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error initiating multipart upload', error);
      }
    );
  }

  uploadComplete(fileName: string, uploadId: string, parts: any[]): void {
    const completeUrl = `${this.baseUrl}/complete`; // Replace with your API endpoint
    const options = {
      headers: this.headers,
      params: {
        fileName: fileName,
        uploadId: uploadId,
      },
      reportProgress: true,
    };
    this.http.post<any>(completeUrl, {parts}, options).subscribe(
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
