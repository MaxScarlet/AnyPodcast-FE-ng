import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';
import { LogRec } from '../models/LogRec';
import { LogLevel } from '../models/LogLevel';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private mainUrl: string = `${environment.loggerUrl}/logrec`;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(private http: HttpClient) {}

  create<T>(msg: string, data: string, logType: LogLevel): Observable<T> {
    const logRec: LogRec = {
      UserID: 'global',
      Msg: msg,
      Data: data,
      LogType: logType,
    };
    const response = this.http.post(this.mainUrl, logRec, { headers: this.headers }) as Observable<T>;
    return response;
  }
}
