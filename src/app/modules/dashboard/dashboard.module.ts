import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WidgetComponent } from './form/widget/widget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddDashboardComponent } from './form/add-dashboard/add-dashboard.component';
import { ThemeModule } from '../../../themes/theme.module';
import { TemplatesModule } from '../templates/templates.module';

@NgModule({
  declarations: [DashboardComponent, WidgetComponent, AddDashboardComponent],
  imports: [
    CommonModule,
    ThemeModule,
    ReactiveFormsModule,
    FormsModule,
    TemplatesModule,
  ],
  exports: [DashboardComponent, WidgetComponent, AddDashboardComponent],
})
export class DashboardModule {}
