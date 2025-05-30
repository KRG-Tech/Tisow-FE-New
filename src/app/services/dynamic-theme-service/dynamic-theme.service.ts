import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DynamicThemeService {
  navbarView: boolean = true;
  mode = 'light';
  private themeStyle: string = 'teal';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private auth: AuthService
  ) {
    this.switchMode(this.mode);
  }

  switchTheme(theme: string | null) {
    if (theme) {
      let themeLink = this.document.getElementById(
        'app-theme'
      ) as HTMLLinkElement;
      const theme_name = themeLink.href.split('/').slice(-1)[0];
      const themeStyle = theme_name.split('-').slice(-1)[0].replace('.css', '');
      const alter_theme = theme_name.replace(themeStyle, theme);
      this.themeStyle = theme;
      if (themeLink) {
        themeLink.href = alter_theme;
      }
      this.auth.themeStyle = theme;
    }
  }
  switchMode(mode: string | null = null) {
    let themeLink = this.document.getElementById(
      'app-theme'
    ) as HTMLLinkElement;

    if (themeLink) {
      const theme_name = themeLink.href.split('/').slice(-1)[0];
      if (mode) {
        this.mode = mode;
      } else {
        this.mode = this.mode == 'dark' ? 'light' : 'dark';
      }
      const theme = theme_name.includes('dark')
        ? theme_name.replace('dark', this.mode)
        : theme_name.replace('light', this.mode);
      themeLink.href = theme;
    }
    this.auth.themeMode = this.mode;
  }

  setNavBar() {
    this.navbarView = !this.navbarView;
  }
  get getCurrTheme(): string {
    return this.themeStyle;
  }

  get getNavBar(): boolean {
    return this.navbarView;
  }
}
