import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  Validators,
} from '@angular/forms';
import { DataFetcherService } from '../../../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-modbus-device',
  templateUrl: './add-modbus-device.component.html',
  styleUrl: './add-modbus-device.component.css',
})
export class AddModbusDeviceComponent implements OnInit {
  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeFormDialogue: EventEmitter<void> = new EventEmitter<void>();
  @Input() host_id!: any;
  @Output() saveEditedHost: EventEmitter<any> = new EventEmitter<void>();
  @Input() editProp: any = { edit: false };
  @Input() visibility: boolean = false;

  formModule: 'device' | 'tags' = 'device';
  DeviceForm!: FormGroup;
  hostData: any;

  constructor(
    private readonly serverFetch: DataFetcherService,
    private readonly fb: FormBuilder,
    private readonly msgService: MessageService
  ) {}

  ngOnInit(): void {
    this.DeviceForm = this.fb.group({
      mac: ['', Validators.required],
      device_name: ['', Validators.required],
      manufacturer: [''],
      description: [''],
      tags: this.fb.array([], Validators.required),
      frequency: [60, [Validators.required, Validators.min(40)]],
    });
    if (this.editProp.edit) {
      this.DeviceForm.patchValue({
        mac: this.editProp.mac,
        device_name: this.editProp.device_name,
        description: this.editProp.description,
        frequency: this.editProp.frequency,
      });
    }
    this.addTag();
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

  deviceDialogue() {
    this.host_id = parseInt(this.host_id);
    this.visibility = true;
  }

  formStepper(formModule: 'device' | 'tags') {
    this.formModule = formModule;
  }

  get tagControl(): FormArray {
    return this.DeviceForm.get('tags') as UntypedFormArray;
  }

  get deviceValid() {
    const { mac, device_name, frequency } = this.DeviceForm.getRawValue();
    return mac && device_name && frequency;
  }

  addTag() {
    const address = this.tagControl.length;
    if (this.editProp.edit && address <= 0) {
      this.editProp.tags.forEach((tag: any, index: number) => {
        this.tagControl.push(
          this.fb.group({
            tag: [tag.tag, Validators.required],
            id: [tag.id, Validators.required],
            dismissBtn: [index >= 1 ? true : false],
          })
        );
      });
    } else {
      this.tagControl.push(
        this.fb.group({
          tag: ['', Validators.required],
          id: [address, Validators.required],
          dismissBtn: [address >= 1 ? true : false],
        })
      );
    }
  }

  remmoveTag(index: number) {
    this.tagControl.removeAt(index);
  }

  saveEditedForm() {
    const deviceData = this.DeviceForm.getRawValue();

    let payload = {
      dev_id: this.editProp.id,
      ...deviceData,
    };
    payload.tags = deviceData.tags.map((item: any) => {
      return { id: item.id, tag: item.tag, tag_name: item.tag };
    });
    this.saveEditedHost.emit(payload);
    this.closeDialogue();
  }

  addDevice() {
    const { devices, id, ...hostData } = this.hostData;
    const deviceData = this.DeviceForm.getRawValue();
    let payload = {
      ...this.hostData,
      host_id: id,
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

  closeDialogue() {
    this.serverFetch.cancelRequest();
    this.visibility = false;
    this.formModule = 'device';
    this.DeviceForm.reset({ frequency: 60 });
    this.closeFormDialogue.emit();
  }
}
