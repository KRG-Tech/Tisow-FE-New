import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  Validators,
} from '@angular/forms';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';
import { ipValidator } from '../../../../../common_functions/custom_validators';
import { MessageService } from 'primeng/api';
import { filter } from 'rxjs';

@Component({
  selector: 'app-add-modbus-host',
  templateUrl: './add-modbus-host.component.html',
  styleUrl: './add-modbus-host.component.css',
})
export class AddModbusHostComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<any>();
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();

  @Input() visibility: boolean = false;
  @Input() editProp: any = { edit: false };

  formModule: 'host' | 'device' | 'tags' = 'host';
  HostForm!: FormGroup;
  DeviceForm!: FormGroup;
  objectList = [];
  deviceType: string = 'modbus';
  selectedTags: string[] = [];
  parityProp: any[] = [];
  comOptions: any[] = Array.from({ length: 10 }, (_, i) => ({
    label: `COM${i + 1}`,
    key: i + 1,
    data: `COM${i + 1}`,
  }));

  constructor(
    private readonly serverFetch: DataFetcherService,
    private readonly fb: FormBuilder,
    private readonly msgService: MessageService
  ) {
    this.parityProp = [
      { key: '0', label: 'Odd', data: 'O', children: [] },
      { key: '1', label: 'Even', data: 'E', children: [] },
      { key: '2', label: 'None', data: 'N', children: [] },
    ];
  }

  ngOnInit(): void {
    this.HostForm = this.fb.group({
      host: [
        { value: '0.0.0.0', disabled: true },
        [Validators.required, ipValidator],
      ],
      host_name: ['', Validators.required],
      com_port: ['', Validators.required],
      port: [3000],
      baud_rate: [19200, Validators.required],
      parity: ['', Validators.required],
      byte_size: [8, Validators.required],
      stop_bits: [1, Validators.required],
    });

    if (this.editProp.edit) {
      let par = this.parityProp.filter(
        (item) => item.data == this.editProp.other_conf.parity
      );
      if (par) {
        par = par[0];
      }
      this.HostForm.patchValue({
        host: this.editProp.host,
        host_name: this.editProp.host_name,
        com_port: {
          label: this.editProp.other_conf.com_port,
          data: this.editProp.other_conf.com_port,
        },
        port: this.editProp.port,
        baud_rate: this.editProp.other_conf.baud_rate,
        parity: par,
        byte_size: this.editProp.other_conf.byte_size,
        stop_bits: this.editProp.other_conf.stop_bits,
      });
    }

    this.DeviceForm = this.fb.group({
      mac: ['', Validators.required],
      device_name: ['', Validators.required],
      manufacturer: [''],
      description: [''],
      tags: this.fb.array([], Validators.required),
      frequency: [60, [Validators.required, Validators.min(40)]],
    });
    this.addTag();
  }

  formStepper(formModule: 'host' | 'device' | 'tags') {
    this.formModule = formModule;
  }

  get tagControl(): FormArray {
    return this.DeviceForm.get('tags') as UntypedFormArray;
  }

  addTag() {
    const address = this.tagControl.length;
    this.tagControl.push(
      this.fb.group({
        tag: ['', Validators.required],
        id: [address, Validators.required],
        dismissBtn: [address >= 1 ? true : false],
      })
    );
  }

  remmoveTag(index: number) {
    this.tagControl.removeAt(index);
  }

  get deviceValid() {
    const { mac, device_name, frequency } = this.DeviceForm.getRawValue();
    return mac && device_name && frequency;
  }

  addhostDevice() {
    const { com_port, host, host_name, port, parity, ...hostData } =
      this.HostForm.getRawValue();
    const deviceData = this.DeviceForm.getRawValue();
    let payload = {
      type: this.deviceType,
      host,
      host_name,
      port,
      other_conf: {
        connection_type: 'rtu',
        com_port: com_port.data,
        ...hostData,
        parity: parity.data,
      },
      device: {
        ...deviceData,
        id: 0,
      },
    };
    payload.device.tags = deviceData.tags.map((item: any) => {
      return { id: item.id, tag: item.tag, tag_name: item.tag };
    });
    this.serverFetch.fetchServer(payload, 'AddDevice').subscribe({
      next: (response: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
        this.refreshPage.emit();
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
  }

  saveEditedForm() {
    const { com_port, host, host_name, port, parity, ...hostData } =
      this.HostForm.getRawValue();
    let payload = {
      type: this.deviceType,
      host,
      host_name,
      port,
      other_conf: {
        connection_type: 'rtu',
        com_port: com_port.data,
        ...hostData,
        parity: parity.data,
      },
    };
    this.saveEditedHost.emit(payload);
    this.closeDialogue();
  }

  closeDialogue() {
    this.serverFetch.cancelRequest();
    this.closeFormDialogue.emit();
    this.visibility = false;
    this.formModule = 'host';
    this.HostForm.reset({
      port: 1,
      host: '0.0.0.0',
      baud_rate: 19200,
      byte_size: 8,
      stop_bits: 1,
    });
    this.DeviceForm.reset({ frequency: 60 });
  }
}
