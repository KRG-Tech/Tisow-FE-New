import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TableBtnComponent } from './table-btn/table-btn.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WidgetUtilComponent } from './widget-util/widget-util.component';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ThemeModule } from '../../../themes/theme.module';

@NgModule({
  declarations: [SidenavComponent, TableBtnComponent, WidgetUtilComponent],
  imports: [
    CommonModule,
    ThemeModule,
    ReactiveFormsModule,
    AgGridAngular,
    AgGridModule,
  ],
  exports: [SidenavComponent, TableBtnComponent, WidgetUtilComponent],
})
export class TemplatesModule {}
