// import { HostListener, Injectable } from '@angular/core';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   templateLoadedParam: boolean = false;
//   constructor(private router: Router) {}

//   get userLoggedIn(): boolean {
//     return sessionStorage.getItem('logged_in') == 'true' ? true : false;
//   }

//   get templateLoaded(): boolean {
//     return this.templateLoadedParam;
//   }
//   set templateLoaded(param: boolean) {
//     this.templateLoadedParam = param;
//   }
//   set setUserLoggedIn(logged: string) {
//     sessionStorage.setItem('logged_in', logged);
//   }

//   set setUserDetails(data: any) {
//     sessionStorage.setItem('userdata', JSON.stringify(data));
//   }

//   get getUserDetails(): any {
//     const data = sessionStorage.getItem('userdata');
//     return data ? JSON.parse(data) : {};
//   }

//   set accessToken(token: string) {
//     sessionStorage.setItem('token', token);
//   }

//   get accessWrite() {
//     return this.getUserDetails.rule == 'write' ? true : false;
//   }

//   get accessToken(): string | null {
//     return sessionStorage.getItem('token');
//   }

//   set themeStyle(style: string) {
//     sessionStorage.setItem('style', style);
//   }

//   get themeStyle(): string | null {
//     return sessionStorage.getItem('style');
//   }

//   set themeMode(mode: string) {
//     sessionStorage.setItem('mode', mode);
//   }
//   get themeMode(): string | null {
//     return sessionStorage.getItem('mode');
//   }
// }

import { HostListener, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  templateLoadedParam: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  get userLoggedIn(): boolean {
    return sessionStorage.getItem('logged_in') == 'true';
  }

  get templateLoaded(): boolean {
    return this.templateLoadedParam;
  }

  set templateLoaded(param: boolean) {
    this.templateLoadedParam = param;
  }

  set setUserLoggedIn(logged: string) {
    sessionStorage.setItem('logged_in', logged);
  }

  set setUserDetails(data: any) {
    sessionStorage.setItem('userdata', JSON.stringify(data));
  }

  get getUserDetails(): any {
    const data = sessionStorage.getItem('userdata');
    return data ? JSON.parse(data) : {};
  }

  set accessToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  get accessWrite() {
    return this.getUserDetails.rule == 'write';
  }

  get accessToken(): string | null {
    return sessionStorage.getItem('token');
  }

  set themeStyle(style: string) {
    sessionStorage.setItem('style', style);
  }

  get themeStyle(): string | null {
    return sessionStorage.getItem('style');
  }

  set themeMode(mode: string) {
    sessionStorage.setItem('mode', mode);
  }

  get themeMode(): string | null {
    return sessionStorage.getItem('mode');
  }

  // ✅ New Login Method
  login(email: string, password: string): Observable<any> {
    const url = 'http://localhost:8002/login'; // Adjust if needed
    const payload = { email, password };

    return this.http.post<any>(url, payload).pipe(
      tap((res) => {
        if (res && res.token && res.data) {
          this.accessToken = res.token;
          this.setUserDetails = res.data;
          this.setUserLoggedIn = 'true';
          // Optional: redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
}
