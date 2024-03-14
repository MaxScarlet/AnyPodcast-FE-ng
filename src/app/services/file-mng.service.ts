import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadConfig } from '../models/Config';
import { environment } from 'src/environment';

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
}
