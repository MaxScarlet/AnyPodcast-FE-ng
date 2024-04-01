import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { ServiceUserAuthorized } from './service-user-auth';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class EpisodeService extends ServiceUserAuthorized {
  private mainUrl: string = `${environment.episodeUrl}/episode`;

  constructor(private http: HttpClient, public override auth: AuthService) {
    super(auth);
  }

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

  create<T>(episode: any): Observable<T> {
    const fullUrl: string = `${this.mainUrl}`;
    const response = this.http.post(fullUrl, episode, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }

  update<T>(episode: any, id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.put(fullUrl, episode, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }
  delete<T>(id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.delete(fullUrl, {
      headers: this.headers,
    }) as Observable<T>;
    return response;
  }
}
