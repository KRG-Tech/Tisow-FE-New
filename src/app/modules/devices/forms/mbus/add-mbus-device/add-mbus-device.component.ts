import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-mbus-device',
  templateUrl: './add-mbus-device.component.html',
  styleUrl: './add-mbus-device.component.css',
})
export class AddMbusDeviceComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<void>();
  @Input() host_id!: any;
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();
  @Input() editProp: any = { edit: false };
  @Input() visibility: boolean = false;

  addDeviceForm!: FormGroup;
  objectList = [];
  selectedTags: string[] = [];
  showInfo: boolean = true;
  showTags: boolean = false;
  hostData: any;
  deviceForm: boolean = true;

  deviceDialogue() {
    this.host_id = parseInt(this.host_id);
    this.visibility = true;
  }

  constructor(
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addDeviceForm = this.fb.group({
      mac: [{ value: '', disabled: true }, Validators.required],
      device_name: ['', Validators.required],
      device_manufacturer: [''],
      device_description: [''],
      address: [1],
      baud_rate: [2400],
      tagList: ['', Validators.required],
      frequency: [60, Validators.required],
    });

    if (this.editProp.edit) {
      this.fetchDeviceTags();
    }

    this.addDeviceForm.get('tagList')?.valueChanges.subscribe((item: []) => {
      this.selectedTags = item.map((item: any) => {
        return item.tag_name;
      });
    });
  }

  ngAfterViewInit(): void {
    if (!this.editProp.edit) {
      this.serverFetch
        .fetchServer({ host_id: parseInt(this.host_id) }, 'GetHostData')
        .subscribe({
          next: (response: any) => {
            this.hostData = response.body.data;
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
  }

  fetchDeviceTags() {
    this.showInfo = false;
    this.serverFetch
      .fetchServer(
        {
          id: this.editProp.id,
          device_name: this.editProp.device_name,
        },
        'GetTags'
      )
      .subscribe({
        next: (response: any) => {
          const data = response.body.data;
          this.objectList = data.tags.map((item: any, index: number) => {
            return {
              key: item.tag,
              label: item.tag,
              data: {
                tag: item.tag,
                id: item.id,
                tag_name: item.tag_name,
              },
            };
          });
          this.addDeviceForm.patchValue({
            mac: this.editProp.mac,
            device_name: this.editProp.device_name,
            device_description: this.editProp.description,
            device_manufacturer: this.editProp.manufacturer,
            address: this.editProp.other_conf.address,
            baud_rate: this.editProp.other_conf.baud_rate,
            frequency: this.editProp.frequency,
            tagList: this.editProp.tags.map((item: any, index: number) => {
              return {
                tag: item.tag,
                id: item.id,
                tag_name: item.tag_name,
              };
            }),
          });
          this.showInfo = true;
        },
        error: (error) => {
          this.showInfo = true;
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
  }

  saveEditedForm() {
    const deviceData = this.addDeviceForm.getRawValue();

    let payload = {
      dev_id: this.editProp.id,
      mac: deviceData.mac,
      device_name: deviceData.device_name,
      tags: deviceData.tagList,
      description: deviceData.device_description,
      frequency: deviceData.frequency,
      instant_id: deviceData.mac,
      other_conf: {
        address: deviceData.address,
        baud_rate: deviceData.baud_rate,
      },
    };
    this.saveEditedHost.emit(payload);
    this.cancelForm();
  }

  fetchDevices() {
    this.showInfo = false;
    const deviceData = this.addDeviceForm.getRawValue();
    const hostData = this.hostData['other_conf'];
    const payload = {
      device_type: this.hostData['device_type'],
      host: this.hostData['host'],
      host_name: this.hostData['host_name'],
      connection_type: hostData['connection_type'],
      port: this.hostData['port'],
      com_port: hostData['com_port'],
      address: deviceData['address'],
      baud_rate: deviceData['baud_rate'],
      host_add: false,
    };
    this.serverFetch.fetchServer(payload, 'GetMbusDevices').subscribe({
      next: (response: any) => {
        const data = response.body.data;
        this.objectList = data['objectList'].map((item: any, index: number) => {
          return {
            key: item.tag,
            label: item.tag,
            data: {
              tag: item.tag,
              id: item.id,
              tag_name: item.tag_name,
            },
          };
        });
        this.addDeviceForm.patchValue({ mac: data['mac'] });
        this.showInfo = true;
      },
      error: (error) => {
        this.showInfo = true;
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });
  }

  get is_mac_valid() {
    const macControl = this.addDeviceForm?.get('mac');
    const deviceNameControl = this.addDeviceForm?.get('device_name');

    return macControl?.value && deviceNameControl?.value;
  }

  get searchDisabled() {
    const address = this.addDeviceForm?.get('address');
    const baud_rate = this.addDeviceForm?.get('address');
    return address?.value && baud_rate?.value;
  }

  addDevice() {
    const deviceInfo = this.hostData;
    const deviceConfig = this.addDeviceForm.getRawValue();
    const payload = {
      type: deviceInfo.type,
      host: deviceInfo.host,
      host_name: deviceInfo.host_name,
      host_id: this.host_id,
      port: deviceInfo.port,
      other_conf: {
        com_port: deviceInfo.other_conf.com_port,
        connection_type: deviceInfo.other_conf.connection_type,
      },
      device: {
        device_name: deviceConfig.device_name,
        id: deviceConfig.mac,
        mac: deviceConfig.mac,
        description: deviceConfig.device_description,
        manufacturer: deviceConfig.device_manufacturer,
        frequency: deviceConfig.frequency,
        tags: deviceConfig.tagList,
        other_conf: {
          baud_rate: deviceConfig.baud_rate,
          address: deviceConfig.address,
        },
      },
    };

    this.serverFetch.fetchServer(payload, 'AddDevice').subscribe({
      next: (response: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
        this.refreshPage.emit();
        this.cancelForm();
      },
      error: (error) => {
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });
    return true;
  }

  resetDeviceForm() {
    this.addDeviceForm.reset(
      {
        device: '',
        mac: '',
        device_name: '',
        device_manufacturer: '',
        device_description: '',
        tagList: '',
        device_id: '',
        frequency: 60,
      },
      { onlySelf: true, emitEvent: false }
    );
    this.objectList = [];
    this.selectedTags = [];
    this.showInfo = true;
    this.showTags = false;
  }

  cancelForm() {
    this.resetDeviceForm();
    this.serverFetch.cancelRequest();
    this.visibility = false;
    this.closeFormDialogue.emit();
  }

  toggleForm() {
    this.deviceForm = !this.deviceForm;
  }
}
