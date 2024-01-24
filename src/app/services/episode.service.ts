// episode.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class EpisodeService {
  private mainUrl: string = `${environment.episodeUrl}/episode`;
  private PodcastID: string = '658ee04c6a3f62e78801b183';
 
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(private http: HttpClient) {}

  get<T>(): Observable<T[]> {
    const fullUrl: string = `${this.mainUrl}?PodcastID=${this.PodcastID}`;
    const response = this.http.get(fullUrl, { headers: this.headers }) as Observable<T[]>;

    console.log(response);

    return response;
  }
}
