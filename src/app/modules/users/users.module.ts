import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ThemeModule } from '../../../themes/theme.module';

@NgModule({
  declarations: [LoginComponent, UsersComponent],
  imports: [
    CommonModule,
    ThemeModule,
    ReactiveFormsModule,
    AgGridAngular,
    AgGridModule,
  ],
  exports: [LoginComponent, UsersComponent],
})
export class UsersModule {}
