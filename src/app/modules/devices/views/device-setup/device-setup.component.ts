import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DataFetcherService } from '../../../../services/data-fetcher/data-fetcher.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-device-setup',
  templateUrl: './device-setup.component.html',
  styleUrl: './device-setup.component.css',
})
export class DeviceSetupComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Input() data!: { [key: string]: any };
  @Input() device_type!: string;

  editProp: any;
  device_name: string = '';
  showEditForm: boolean = false;
  menuItem: MenuItem[] = [];
  protocol: any;

  constructor(
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.menuItem = [
      {
        label: 'Options',
        items: [
          ...(this.auth.accessWrite
            ? [
                {
                  label: 'Edit',
                  icon: 'pi pi-file-edit',
                  styleClass: 'font-normal text-sm',
                  command: () => this.showForm(),
                },
              ]
            : []),
          ...(this.device_type == 'host'
            ? [
                {
                  label: 'Devices',
                  icon: 'pi pi-arrow-up-right-and-arrow-down-left-from-center',
                  styleClass: 'font-normal text-sm',
                  command: () => this.navigateToDevice(),
                },
              ]
            : []),
          ...(this.auth.accessWrite
            ? [
                {
                  label: 'Delete',
                  icon: 'pi pi-trash',
                  styleClass: 'font-normal text-sm',
                  command: () => this.deleteDevice(),
                },
              ]
            : []),
        ],
      },
    ];
    this.device_name =
      this.device_type == 'host'
        ? this.data['host_name']
        : this.data['device_name'];
  }

  deleteDevice() {
    const payload = {
      type: this.device_type,
      id: this.data['id'],
      device_name: this.device_name,
    };
    this.serverFetch.fetchServer(payload, 'DeleteHostDevice').subscribe({
      next: (response: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
        this.refreshPage.emit();
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

  navigateToDevice() {
    this.router.navigate([
      `/hosts/${this.data['type']}/${this.data['host_name']}/${this.data['id']}`,
    ]);
  }

  showForm() {
    this.protocol =
      this.device_type === 'device'
        ? this.data['host']['type']
        : this.data['type'];
    this.editProp = { edit: true, ...this.data };
    this.showEditForm = true;
  }

  get deviceName() {
    let deviceName = '';
    if (this.data['type'] == 'bacnet') {
      deviceName =
        this.data['device_type'] == 'host'
          ? this.data['host']
          : this.data['mac'];
    } else {
      deviceName =
        this.data['device_type'] == 'host'
          ? this.data['other_conf']['com_port']
          : this.data['mac'];
    }
    return deviceName;
  }

  closeEditWindow() {
    this.showEditForm = false;
  }
}
