// episode.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class EpisodeService {
  private mainUrl: string = `${environment.episodeUrl}/episode`;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  get<T>(podcastID: string): Observable<T[]> {
    const fullUrl: string = `${this.mainUrl}?PodcastID=${podcastID}`;
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

  postEpisode<T>(episode: any): Observable<T> {
    const fullUrl: string = `${this.mainUrl}`;
    const response = this.http.post(fullUrl, episode, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }

  updateEpisode<T>(episode: any, id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.put(fullUrl, episode, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }
  deleteEpisode<T>(id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.delete(fullUrl, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }
}
