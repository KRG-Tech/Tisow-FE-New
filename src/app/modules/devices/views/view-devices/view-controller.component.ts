import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicThemeService } from '../../../../services/dynamic-theme-service/dynamic-theme.service';
import { DataFetcherService } from '../../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-view-controller',
  templateUrl: './view-controller.component.html',
  styleUrl: './view-controller.component.css',
})
export class ViewControllerComponent implements OnInit, OnDestroy {
  deviceLists: [] = [];
  deviceView: boolean = false;
  private intervalId: any;
  host_id = undefined;
  hostName: string = '';
  protocol: 'bacnet' | 'mbus' | 'modbus' = 'bacnet';

  constructor(
    public themeServ: DynamicThemeService,
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private route: ActivatedRoute,
    public auth: AuthService
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe({
      next: (response: any) => {
        this.deviceLists = response['data'].body.data;
        this.deviceView = true;
      },
      error: (error) => {
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });

    this.route.params.subscribe((params) => {
      this.host_id = params['id'];
      this.protocol = params['protocol'];
      this.hostName = params['host_name'];
    });

    this.intervalId = setInterval(() => {
      this.reloadPage();
    }, 80000);
  }

  reloadPage() {
    this.deviceView = false;
    this.serverFetch.fetchServer({ id: this.host_id }, 'GetDevices').subscribe({
      next: (response: any) => {
        this.deviceLists = response.body.data;
        this.deviceView = true;
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

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
