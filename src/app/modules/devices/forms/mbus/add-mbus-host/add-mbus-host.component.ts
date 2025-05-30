import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';
import { ipValidator } from '../../../../../common_functions/custom_validators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-mbus-host',
  templateUrl: './add-mbus-host.component.html',
  styleUrl: './add-mbus-host.component.css',
})
export class AddMbusHostComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<void>();
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();
  @Input() visibility: boolean = false;
  @Input() editProp: any = { edit: false };

  formModule: 'host' | 'device' | 'tags' = 'host';

  mbusHostForm!: FormGroup;
  deviceForm!: FormGroup;

  objectList = [];
  deviceType: string = 'mbus';
  selectedTags: string[] = [];
  showInfo: boolean = false;
  connectionType: any[] = [
    { label: 'Serial', value: 'serial' },
    { label: 'Socket', value: 'socket', constant: true },
  ];
  comOptions: any[] = Array.from({ length: 10 }, (_, i) => ({
    label: `COM${i + 1}`,
    key: i + 1,
    data: `COM${i + 1}`,
  }));

  constructor(
    private serverFetch: DataFetcherService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private msgService: MessageService
  ) {}

  private setValidators(fields: string[], validators: any[]) {
    fields.forEach((field) => {
      const control = this.mbusHostForm.get(field);
      if (control) {
        control.setValidators(validators); // Pass the array of validators
        control.updateValueAndValidity(); // Update the validity after setting
      }
    });
  }

  private clearValidators(fields: string[]) {
    fields.forEach((field) => {
      const control = this.mbusHostForm.get(field);
      if (control) {
        control.clearValidators(); // Clear validators
        control.updateValueAndValidity(); // Update the validity after clearing
      }
    });
  }

  ngOnInit(): void {
    this.mbusHostForm = this.fb.group({
      host_name: ['', Validators.required],
      host: ['0.0.0.0'],
      connection_type: ['serial', Validators.required],
      port: [47808],
      com_port: [''],
      address: [1],
      baud_rate: [2400],
    });

    if (this.editProp.edit) {
      this.mbusHostForm.get('address')?.disable();
      this.mbusHostForm.get('baud_rate')?.disable();
      this.mbusHostForm.patchValue({
        host: this.editProp.host,
        host_name: this.editProp.host_name,
        com_port: {
          label: this.editProp.other_conf.com_port,
          data: this.editProp.other_conf.com_port,
        },
        port: this.editProp.port,
        connection_type: this.editProp.other_conf.connection_type,
      });
    }

    this.deviceForm = this.fb.group({
      mac: [{ value: '', disabled: true }, Validators.required],
      device_name: ['', Validators.required],
      device_manufacturer: [''],
      device_description: [''],
      tagList: ['', Validators.required],
      frequency: [60, Validators.required],
    });

    this.mbusHostForm
      .get('connection_type')
      ?.valueChanges.subscribe((connection) => {
        if (connection === 'serial') {
          this.setValidators(
            ['com_port', 'address', 'baud_rate'],
            [Validators.required]
          );
          this.clearValidators(['host', 'port']);
        } else if (connection == 'socket') {
          this.clearValidators(['com_port', 'address', 'baud_rate']);
          this.setValidators(['host'], [Validators.required, ipValidator]);
          this.setValidators(['port'], [Validators.required]);
        }
        this.mbusHostForm.updateValueAndValidity();
        this.cdr.detectChanges();
      });

    this.deviceForm.get('tagList')?.valueChanges.subscribe((item: []) => {
      this.selectedTags = item.map((item: any) => {
        return item.tag_name;
      });
    });
  }

  fetchDevices() {
    this.showInfo = false;
    const payload = this.mbusHostForm.getRawValue();
    payload.device_type = this.deviceType;
    payload.com_port = payload.com_port['data'];

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
        this.deviceForm.patchValue({ mac: data['mac'] });
        this.showInfo = true;
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

  get is_mac_valid() {
    const macControl = this.deviceForm?.get('mac');
    const deviceNameControl = this.deviceForm?.get('device_name');

    return macControl?.value && deviceNameControl?.value;
  }

  prevStepper(formModule: 'host' | 'device') {
    if (formModule == 'host') {
      this.serverFetch.cancelRequest();
      this.formModule = formModule;
    } else {
      this.formModule = formModule;
    }
  }

  nextStepper(formModule: 'device' | 'tags') {
    this.formModule = formModule;
  }

  get selectedConnection() {
    return this.mbusHostForm.get('connection_type')?.value;
  }

  saveEditedForm() {
    const { com_port, host, host_name, port, connection_type, ...hostData } =
      this.mbusHostForm.getRawValue();
    let payload = {
      type: this.deviceType,
      host,
      host_name,
      port,
      other_conf: {
        com_port: com_port.data,
        connection_type: connection_type,
      },
    };
    this.saveEditedHost.emit(payload);
    this.closeDialogue();
  }

  resetHostForm() {
    this.mbusHostForm.reset({
      host: '0.0.0.0',
      connection_type: 'serial',
      port: 47808,
      address: 1,
      baud_rate: 2400,
    });
  }

  closeDialogue() {
    this.resetHostForm();
    this.serverFetch.cancelRequest();
    this.visibility = false;
    this.formModule = 'host';
    this.closeFormDialogue.emit();
  }

  addDevice() {
    const deviceInfo = this.mbusHostForm.getRawValue();
    const deviceConfig = this.deviceForm.getRawValue();
    const payload = {
      type: this.deviceType,
      host: deviceInfo.host,
      host_name: deviceInfo.host_name,
      port: deviceInfo.port,
      other_conf: {
        com_port: deviceInfo.com_port['data'],
        connection_type: deviceInfo.connection_type,
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
          address: deviceInfo.address,
          baud_rate: deviceInfo.baud_rate,
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
}
