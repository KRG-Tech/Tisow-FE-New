import { Component, OnInit } from '@angular/core';
import { WebsocketServiceService } from '../../../services/websocket-service/websocket-service.service';
import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  DashboardView: boolean = false;
  data: [] = [];
  dashboards: {}[] = [];
  selectedDashboard: { [key: string]: any } = {
    name: 'No Dashboard Selected',
    id: 0,
  };
  dashboardForm!: FormGroup;
  constructor(
    public themeServ: DynamicThemeService,
    private serverFetch: DataFetcherService,
    private auth: AuthService,
    private msgService: MessageService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.dashboardForm = this.fb.group({
      dashboardName: ['', Validators.required],
    });
    this.dashboardForm
      .get('dashboardName')
      ?.valueChanges.subscribe((dashboard: any) => {
        this.selectedDashboard = dashboard.data;
        this.fetchWidgets();
      });
    this.fetchDashboards();
  }

  fetchDashboards() {
    this.serverFetch
      .fetchServer({ user_id: this.auth.getUserDetails['id'] }, 'Dashboards')
      .subscribe({
        next: (response: any) => {
          this.dashboards = response.body.data.map((data: any) => {
            return {
              key: data.id,
              label: data.name,
              data: { id: data.id, name: data.name },
            };
          });

          if (this.dashboards.length > 0) {
            this.dashboardForm.patchValue({
              dashboardName: this.dashboards[0],
            });
          }
          this.DashboardView = true;
        },
        error: (error) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
  }

  fetchWidgets() {
    this.DashboardView = false;
    this.serverFetch
      .fetchServer({ dashboard_id: this.selectedDashboard['id'] }, 'Widgets')
      .subscribe({
        next: (response: any) => {
          this.data = response.body.data;
          this.DashboardView = true;
        },
        error: (error) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
  }

  refreshDashboard() {
    this.fetchWidgets();
  }
}
