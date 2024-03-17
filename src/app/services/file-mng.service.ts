import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadConfig } from '../models/Config';
import { environment } from 'src/environment';
import { Upload } from '../models/Upload';

@Injectable({
  providedIn: 'root',
})
export class FileMngService {
  private mainUrl: string = `${environment.fileMngUrl}/upload`;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(private http: HttpClient) {}

  getConfig(): Observable<UploadConfig> {
    const response = this.http.get(`${this.mainUrl}/init`, {
      headers: this.headers,
    }) as Observable<UploadConfig>;
    return response;
  }

  init(upload: Upload): Observable<Upload> {
    const response = this.http.post(`${this.mainUrl}/init`, upload, {
      headers: this.headers,
    }) as Observable<Upload>;
    return response;
  }
  complete(upload: Upload, parts: any[]): Observable<Upload> {
    const completePayload = {
      UploadId: upload.UploadId,
      Parts: parts,
    };
    const response = this.http.post(
      `${this.mainUrl}/complete`,
      completePayload,
      {
        headers: this.headers,
      }
    ) as Observable<Upload>;
    return response;
  }
  
  upload(upload: Upload): Observable<Upload> {
    const response = this.http.post(`${this.mainUrl}/upload`, upload, {
      headers: this.headers,
    }) as Observable<Upload>;
    return response;
  }
}