import { Component, HostListener } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { DynamicThemeService } from './services/dynamic-theme-service/dynamic-theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'controller';

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event) {
    if (!this.auth.userLoggedIn) {
      localStorage.clear();
      this.router.navigate(['dashboard']);
    }
  }

  constructor(
    private themeService: DynamicThemeService,
    private primeConfig: PrimeNGConfig,
    private router: Router,
    private auth: AuthService
  ) {
    this.themeService.switchMode(this.auth.themeMode);
    this.themeService.switchTheme(this.auth.themeStyle);
  }
  ngOnInit(): void {
    this.primeConfig.ripple = true;
  }
}
