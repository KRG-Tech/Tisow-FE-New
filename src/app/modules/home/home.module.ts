import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from '../users/users.module';
import { BodyComponent } from './body/body.component';
import { HomeComponent } from './home/home.component';
import { ThemeModule } from '../../../themes/theme.module';

@NgModule({
  declarations: [BodyComponent, HomeComponent],
  imports: [CommonModule, ThemeModule, TemplatesModule, UsersModule],
  exports: [BodyComponent, HomeComponent],
})
export class HomeModule {}
