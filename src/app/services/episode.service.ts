// episode.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class EpisodeService {
  private mainUrl: string = environment.episodeUrl;
  private PodcastID: string = '658ee04c6a3f62e78801b183';
  private fullUrl: string = `${this.mainUrl}?PodcastID=${this.PodcastID}`;

  constructor(private http: HttpClient) {}

  get<T>(): Observable<T[]> {
    const response = this.http.get(this.fullUrl) as Observable<T[]>;

    console.log(response);

    return response;
  }
}
