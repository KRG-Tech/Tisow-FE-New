import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { DynamicThemeService } from '../../../../../services/dynamic-theme-service/dynamic-theme.service';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';
import { ipValidator } from '../../../../../common_functions/custom_validators';

@Component({
  selector: 'app-add-bacnet',
  templateUrl: './add-bacnet.component.html',
  styleUrl: './add-bacnet.component.css',
})
export class AddBacnetComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<void>();
  @Input() visibility: boolean = false;
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();
  @Input() editProp: any = { edit: false };

  formModule: 'host' | 'device' | 'tags' = 'host';
  deviceForm!: FormGroup;
  addDeviceForm!: FormGroup;
  deviceList = [];
  objectList = [];
  deviceType: string = 'bacnet';
  selectedTags: string[] = [];
  showInfo: boolean = false;
  selectedTagCount: Message[] = [];

  constructor(
    public themeServ: DynamicThemeService,
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private fb: FormBuilder
  ) {}

  resetDeviceInfo() {
    this.deviceForm.reset(
      {
        device_type: {
          key: '0',
          label: 'Bacnet',
          data: 'bacnet',
        },
        host: '',
        port: 47808,
        host_name: '',
      },
      { onlySelf: true, emitEvent: false }
    );
    this.deviceList = [];
  }

  resetDeviceConfig() {
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
    this.selectedTags = [];
    this.selectedTagCount = [];
  }

  ngOnInit() {
    this.deviceForm = this.fb.group({
      host: ['', [Validators.required, ipValidator]],
      host_name: ['', Validators.required],
      port: [47808],
    });

    if (this.editProp.edit) {
      this.deviceForm.patchValue({
        host: this.editProp.host,
        host_name: this.editProp.host_name,
        port: this.editProp.port,
      });
    }
    this.addDeviceForm = this.fb.group({
      device: ['', Validators.required],
      mac: [{ value: '', disabled: true }, Validators.required],
      device_name: ['', Validators.required],
      device_manufacturer: [{ value: '', disabled: true }],
      device_description: [''],
      tagList: ['', Validators.required],
      device_id: ['', Validators.required],
      frequency: [60, Validators.required],
    });

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
      } else {
        this.showInfo = false;
      }
    });

    this.addDeviceForm.get('tagList')?.valueChanges.subscribe((item: []) => {
      this.selectedTags = item.map((item: any) => {
        return item.tag_name;
      });
    });
  }

  fetchDevices() {
    const payload = this.deviceForm.getRawValue();
    payload.device_type = this.deviceType;

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
                  data: {
                    tag: item.tag,
                    id: item.id,
                    tag_name: item.tag_name,
                  },
                };
              }),
            },
          };
        });
        this.formModule = 'device';
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
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

  prevStepper(formModule: 'host' | 'device') {
    if (formModule == 'host') {
      this.serverFetch.cancelRequest();
      this.deviceList = [];
      this.resetDeviceConfig();
      this.showInfo = false;
      this.formModule = formModule;
    } else {
      this.formModule = formModule;
    }
  }

  nextStepper(formModule: 'device' | 'tags') {
    this.formModule = formModule;
  }

  saveEditedForm() {
    const hostData = this.deviceForm.getRawValue();
    let payload = {
      type: this.deviceType,
      ...hostData,
    };
    this.saveEditedHost.emit(payload);
    this.closeDialogue();
  }

  addDevice() {
    const deviceInfo = this.deviceForm.getRawValue();
    const deviceConfig = this.addDeviceForm.getRawValue();
    const payload = {
      type: this.deviceType,
      host: deviceInfo.host,
      host_name: deviceInfo.host_name,
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
        this.resetDeviceInfo();
        this.resetDeviceConfig();
        this.refreshPage.emit();
        this.formModule = 'host';
        this.closeDialogue();
      },
      error: (error: any) => {
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });
    return true;
  }

  closeDialogue() {
    this.resetDeviceConfig();
    this.resetDeviceInfo();
    this.serverFetch.cancelRequest();
    this.visibility = false;
    this.formModule = 'host';
    this.closeFormDialogue.emit();
  }
}
