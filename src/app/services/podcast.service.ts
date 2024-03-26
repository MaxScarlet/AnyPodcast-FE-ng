import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class PodcastService {
  private mainUrl: string = `${environment.podcastUrl}/podcast`;

  private userToken: string = '';

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private http: HttpClient, private auth: AuthService) {
    // this.auth.getAccessTokenSilently().subscribe((token) => {
    this.auth.idTokenClaims$.subscribe((claims) => {
      this.userToken = claims?.__raw || '';
      // this.userToken = token || '';
      this.headers = this.headers.set('Authorization', `Bearer ${this.userToken}`);
    });
  }

  get<T>(parentId: string): Observable<T[]> {
    const fullUrl: string = `${this.mainUrl}?UserID=${parentId}`;
    const response = this.http.get(fullUrl, { headers: this.headers }) as Observable<T[]>;
    return response;
  }

  getByID<T>(id: string): Observable<T> {
    //console.log('Headers:', this.headers);
    
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.get(fullUrl, { headers: this.headers }) as Observable<T>;
    return response;
  }
  create<T>(podcast: any): Observable<T> {
    const fullUrl: string = `${this.mainUrl}`;
    const response = this.http.post(fullUrl, podcast, { headers: this.headers }) as Observable<T>;
    return response;
  }

  update<T>(podcast: any, id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.put(fullUrl, podcast, { headers: this.headers, }) as Observable<T>;
    return response;
  }
  delete<T>(id: string): Observable<T> {
    const fullUrl: string = `${this.mainUrl}/${id}`;
    const response = this.http.delete(fullUrl, { headers: this.headers, }) as Observable<T>;
    return response;
  }
}
