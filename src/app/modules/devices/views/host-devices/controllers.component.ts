import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicThemeService } from '../../../../services/dynamic-theme-service/dynamic-theme.service';
import { DataFetcherService } from '../../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrl: './controllers.component.css',
})
export class ControllersComponent implements OnInit, OnDestroy {
  hostLists: [] = [];
  hostView: boolean = false;
  private intervalId: any;
  selectedFile: File | null = null;

  constructor(
    public themeServ: DynamicThemeService,
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.fetchHosts();
    this.intervalId = setInterval(() => {
      this.fetchHosts();
    }, 80000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchHosts() {
    this.hostView = false;
    this.serverFetch.fetchServer(null, 'GetHosts').subscribe({
      next: (response: any) => {
        this.hostLists = response.body.data;
        this.hostView = true;
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

  refreshHosts() {
    window.location.reload();
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      this.selectedFile = file;
    }
  }

  uploadExcelFile() {
    if (!this.selectedFile) {
      this.msgService.add({
        severity: 'warn',
        summary: 'No file',
        detail: 'Please select a file first.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);


    this.serverFetch.fetchServer(formData, 'UploadExcelFile').subscribe({
      next: (res: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: res.message || 'File uploaded successfully!',
        });
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.msgService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: err.error?.detail || 'An error occurred.',
        });
      },
    });
  }
  onFileAutoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadExcelFile(); // Automatically upload after selection
    }
  }

}
