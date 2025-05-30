import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataFetcherService } from '../../../../services/data-fetcher/data-fetcher.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-dashboard',
  templateUrl: './add-dashboard.component.html',
  styleUrl: './add-dashboard.component.css',
})
export class AddDashboardComponent implements OnInit {
  @Output() refreshDashboard: EventEmitter<void> = new EventEmitter<void>();
  visibility: boolean = false;
  dashboardForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private serverFetch: DataFetcherService,
    public auth: AuthService,
    private msgService: MessageService
  ) {}
  ngOnInit(): void {
    this.dashboardForm = this.fb.group({
      dashboard_name: ['', Validators.required],
    });
  }

  dashboardDialogue() {
    this.visibility = true;
  }

  cancelAddDashboard() {
    this.dashboardForm.reset();
    this.visibility = false;
  }

  onDashboardAdd() {
    try {
      if (this.dashboardForm.valid) {
        const payload = this.dashboardForm.getRawValue();
        payload.user_id = this.auth.getUserDetails['id'];
        this.serverFetch.fetchServer(payload, 'AddDashboard').subscribe({
          next: (response: any) => {
            this.msgService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.body.msg,
            });
            this.refreshDashboard.emit();
            this.visibility = false;
          },
          error: (error) => {
            this.msgService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message,
            });
          },
        });
      } else {
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Name should not exceed more than 15 chars',
        });
      }
    } catch (e) {}
  }
}
