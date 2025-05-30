import { Injectable } from '@angular/core';
import { ApiConfigService } from '../api-config/api-config.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataFetcherService {
  private apiServer: any;
  private cancelrequest$: Subject<void> = new Subject<void>();
  constructor(private api: ApiConfigService, private http: HttpClient) {}

  fetchServer(payload: any, apiname: string) {
    try {
      const apiConf = this.api.getApi(apiname);
      this.apiServer = environment.server;
  
      const url = `${this.apiServer}${apiConf['url']}`;
      const isPost = apiConf['method'].toUpperCase() === 'POST';
  
      if (isPost) {
        let headers = new HttpHeaders();
  
        // ❗ Skip manually setting 'Content-Type' if sending FormData
        const options = {
          headers: payload instanceof FormData ? headers : headers.set('Content-Type', 'application/json'),
          observe: 'response' as const,
        };
  
        return this.http
          .post(url, payload, options)
          .pipe(takeUntil(this.cancelrequest$), catchError(this.handleError));
      } else {
        const geturl = Object.keys(payload).length
          ? url
              .replace('firstParam', payload.firstParam)
              .replace('secondParam', payload.secondParam)
          : url;
        return this.http
          .get(geturl, { observe: 'response' })
          .pipe(takeUntil(this.cancelrequest$), catchError(this.handleError));
      }
    } catch (e) {
      return throwError(() => new Error('Something Went Wrong'));
    }
  }
  

  private handleError(error: HttpErrorResponse): Observable<any> {
    error = JSON.parse(error.message);
    if (error.status != 500 && error.status != 404 && error.status != 0) {
      return throwError(() => new Error(error.error.msg));
    } else {
      return throwError(() => new Error('Something Went Wrong'));
    }
  }

  cancelRequest(): void {
    this.cancelrequest$.next();
  }
}
