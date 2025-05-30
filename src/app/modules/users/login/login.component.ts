// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { Router } from '@angular/router';
// import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
// import { AuthService } from '../../../services/auth/auth.service';
// import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css',
// })
// export class LoginComponent implements OnInit {
//   loginForm: FormGroup;
//   constructor(
//     private fb: FormBuilder,
//     private msgService: MessageService,
//     private serverFetch: DataFetcherService,
//     private router: Router,
//     private auth: AuthService,
//     private themeServ: DynamicThemeService
//   ) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }
//   ngOnInit(): void {}

//   get email() {
//     return this.loginForm.controls['email'];
//   }
//   get password() {
//     return this.loginForm.controls['password'];
//   }
//   login() {
//     if (this.loginForm.valid) {
//       const payload = this.loginForm.value;
//       this.serverFetch.fetchServer(payload, 'Login').subscribe({
//         next: (response: any) => {
//           this.auth.setUserLoggedIn = 'true';
//           this.auth.setUserDetails = response.body.data;
//           this.auth.accessToken = response.body.token;
//           this.router.navigate(['/dashboard']);
//         },
//         error: (error) => {
//           this.msgService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: error.message,
//           });
//         },
//       });
//     } else {
//       this.msgService.add({
//         severity: 'error',
//         summary: 'error',
//         detail: 'Message Content',
//       });
//     }
//   }
// }

//----------------------------------auto login------------------------------------------------
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { Router } from '@angular/router';
// import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
// import { AuthService } from '../../../services/auth/auth.service';
// import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';
// import { environment } from 'src/environments/environment'; // <-- Import environment

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css',
// })
// export class LoginComponent implements OnInit {
//   loginForm: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private msgService: MessageService,
//     private serverFetch: DataFetcherService,
//     private router: Router,
//     private auth: AuthService,
//     private themeServ: DynamicThemeService
//   ) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }

//   ngOnInit(): void {
//     // ✅ Auto-login logic only in dev/demo mode
//     if (environment.autoLogin) {
//       this.loginForm.setValue({
//         email: 'balas@krgtech.com',
//         password: 'Bala@123',
//       });

//       // Give Angular time to finish setting up the form before calling login
//       setTimeout(() => {
//         this.login();
//       }, 100);
//     }
//   }

//   get email() {
//     return this.loginForm.controls['email'];
//   }

//   get password() {
//     return this.loginForm.controls['password'];
//   }

//   login() {
//     if (this.loginForm.valid) {
//       const payload = this.loginForm.value;

//       this.loginForm.disable(); // prevent double submission
//       this.serverFetch.fetchServer(payload, 'Login').subscribe({
//         next: (response: any) => {
//           this.auth.setUserLoggedIn = 'true';
//           this.auth.setUserDetails = response.body.data;
//           this.auth.accessToken = response.body.token;
//           this.router.navigate(['/dashboard']);
//         },
//         error: (error) => {
//           this.msgService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: error?.error?.message || 'Login failed. Please try again.',
//           });
//           this.loginForm.enable(); // re-enable form on error
//         },
//       });
//     } else {
//       this.msgService.add({
//         severity: 'error',
//         summary: 'Invalid Input',
//         detail: 'Please fill in all required fields correctly.',
//       });
//     }
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msgService: MessageService,
    private serverFetch: DataFetcherService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private themeServ: DynamicThemeService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const encoded = params['hash'];
      if (encoded) {
        try {
          const decodedString = atob(encoded);
          const credentials = JSON.parse(decodedString);

          const email = credentials.email;
          const password = credentials.password;

          if (email && password) {
            this.loginForm.patchValue({ email, password });
            this.login(); // auto-login
          }
        } catch (err) {
          console.error('Invalid encoded credentials:', err);
        }
      }
    });
  }

  get email() {
    return this.loginForm.controls['email'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  login() {
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.serverFetch.fetchServer(payload, 'Login').subscribe({
        next: (response: any) => {
          this.auth.setUserLoggedIn = 'true';
          this.auth.setUserDetails = response.body.data;
          this.auth.accessToken = response.body.token;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Login failed',
          });
        },
      });
    } else {
      this.msgService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in valid credentials.',
      });
    }
  }
}
