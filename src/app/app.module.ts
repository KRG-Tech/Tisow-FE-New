import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import {
  MessageService,
  PrimeNGConfig,
  ConfirmationService,
} from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { interceptorInterceptor } from './services/interceptor/interceptor.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DevicesModule } from './modules/devices/devices.module';
import { UsersModule } from './modules/users/users.module';
import { HomeModule } from './modules/home/home.module';
import { TemplatesModule } from './modules/templates/templates.module';

const initializeAppFactory = (primeConfig: PrimeNGConfig) => () => {
  primeConfig.ripple = true;
};
@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    DashboardModule,
    DevicesModule,
    UsersModule,
    HomeModule,
    TemplatesModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    provideHttpClient(withInterceptors([interceptorInterceptor])),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [PrimeNGConfig],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
