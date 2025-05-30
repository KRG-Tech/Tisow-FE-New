import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';

@Component({
  selector: 'app-add-bacnet-device',
  templateUrl: './add-bacnet-device.component.html',
  styleUrl: './add-bacnet-device.component.css',
})
export class AddBacnetDeviceComponent implements OnInit, AfterViewInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<void>();
  @Input() host_id!: any;
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();
  @Input() editProp: any = { edit: false };
  @Input() visibility: boolean = false;

  addDeviceForm!: FormGroup;
  deviceList: any[] = [];
  objectList = [];
  selectedTags: string[] = [];
  showInfo: boolean = false;
  showTags: boolean = false;
  hostData: any;
  deviceForm: boolean = true;
  devicesLoaded: boolean = false;

  deviceDialogue() {
    this.host_id = parseInt(this.host_id);
    this.fetchDevices();
    this.visibility = true;
  }

  constructor(
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addDeviceForm = this.fb.group({
      device: ['', Validators.required],
      mac: [{ value: '', disabled: true }, Validators.required],
      device_name: ['', Validators.required],
      device_manufacturer: [{ value: '', disabled: true }, Validators.required],
      device_description: [''],
      tagList: ['', Validators.required],
      device_id: ['', Validators.required],
      frequency: [60, Validators.required],
    });

    if (this.editProp.edit) {
      this.fetchDeviceTags();
    }

    this.addDeviceForm.get('device')?.valueChanges.subscribe((item: any) => {
      if (item !== '') {
        this.addDeviceForm.patchValue({
          mac: item.data.mac,
          device_name: item.data.name,
          device_manufacturer: item.data.manufacturer,
          device_id: item.data.id,
        });
        this.objectList = item.data.objectList;
        this.showInfo = true;
        this.showTags = true;
        if (this.editProp.edit) {
          const tags = this.editProp.tags;
          this.addDeviceForm.patchValue({
            tagList: this.editProp.tags.map((item: any, index: number) => {
              return {
                tag: item.tag,
                id: item.id,
                tag_name: item.tag_name,
              };
            }),
          });
        }
      } else {
        this.showInfo = false;
        this.showTags = false;
      }
    });

    this.addDeviceForm.get('tagList')?.valueChanges.subscribe((item: []) => {
      this.selectedTags = item.map((item: any) => {
        return `${item.tag_name}-${item.id}`;
      });
    });
  }

  ngAfterViewInit(): void {
    if (!this.editProp.edit) {
      this.serverFetch
        .fetchServer({ host_id: this.host_id }, 'GetHostData')
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

  fetchDevices() {
    this.devicesLoaded = false;
    const payload = {
      device_type: this.hostData['device_type'],
      host: this.hostData['host'],
      host_name: this.hostData['host_name'],
      port: this.hostData['port'],
      host_add: false,
    };
    this.serverFetch.fetchServer(payload, 'GetBacnetDevices').subscribe({
      next: (response: any) => {
        const data = response.body.data;
        this.deviceList = data.map((item: any, index: number) => {
          return {
            key: index,
            label: item.dev_name,
            data: {
              id: item.dev_id,
              name: item.dev_name,
              mac: item.mac,
              manufacturer: item.dev_manufacturer,
              objectList: item.objectList.map((item: any, index: number) => {
                return {
                  key: `${item.tag}__${item.id}`,
                  label: item.tag_name,
                  data: { tag: item.tag, id: item.id, tag_name: item.tag_name },
                };
              }),
            },
          };
        });
        this.devicesLoaded = true;
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
      },
      error: (error) => {
        this.devicesLoaded = true;
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });
  }

  fetchDeviceTags() {
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
          const devdat = {
            id: this.editProp.id,
            name: this.editProp.device_name,
            mac: this.editProp.mac,
            manufacturer: this.editProp.dev_manufacturer,
            objectList: data.tags.map((item: any, index: number) => {
              return {
                key: `${item.tag}__${item.id}`,
                label: item.tag_name,
                data: {
                  tag: item.tag,
                  id: item.id,
                  tag_name: item.tag_name,
                },
              };
            }),
          };
          this.deviceList = [
            {
              key: 0,
              label: this.editProp.device_name,
              data: devdat,
            },
          ];

          this.addDeviceForm.patchValue({
            device: { key: 0, label: this.editProp.device_name, data: devdat },
          });

          this.devicesLoaded = true;
          this.msgService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.body.msg,
          });
        },
        error: (error) => {
          this.devicesLoaded = true;
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
      instant_id: deviceData.device_id,
    };
    this.saveEditedHost.emit(payload);
    this.cancelForm();
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
      device: {
        device_name: deviceConfig.device_name,
        id: deviceConfig.device_id,
        mac: deviceConfig.mac,
        manufacturer: deviceConfig.device_manufacturer,
        description: deviceConfig.device_description,
        frequency: deviceConfig.frequency,
        tags: deviceConfig.tagList,
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
    this.deviceList = [];
    this.objectList = [];
    this.selectedTags = [];
    this.showInfo = false;
    this.showTags = false;
    this.selectedTags = [];
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
