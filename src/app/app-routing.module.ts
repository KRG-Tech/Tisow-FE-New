import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './modules/users/login/login.component';
import { HomeComponent } from './modules/home/home/home.component';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
import { ControllersComponent } from './modules/devices/views/host-devices/controllers.component';
import { UsersComponent } from './modules/users/users/users.component';
import { ViewControllerComponent } from './modules/devices/views/view-devices/view-controller.component';
import { devicesResolverResolver } from './services/devices-resolver/devices-resolver.resolver';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'hosts',
    component: ControllersComponent,
  },
  {
    path: 'hosts/:protocol/:host_name/:id',
    component: ViewControllerComponent,
    resolve: { data: devicesResolverResolver },
  },
  { path: 'users', component: UsersComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
