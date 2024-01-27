// episode.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class PodcastService {
  private mainUrl: string = `${environment.podcastUrl}/podcast`;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(private http: HttpClient) {}

  get<T>(parentId : string): Observable<T[]> {
    const fullUrl: string = `${this.mainUrl}?UserID=${parentId}`;
    const response = this.http.get(fullUrl, {
      headers: this.headers,
    }) as Observable<T[]>;
    return response;
  }

  getByID<T>(id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.get(fullUrl, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }
}
