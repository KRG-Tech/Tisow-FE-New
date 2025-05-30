import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataFetcherService } from '../../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.css',
})
export class WidgetComponent implements OnInit {
  @Input() dashboard_id!: number;

  @Output() refreshDashboard: EventEmitter<void> = new EventEmitter<void>();
  visibility: boolean = false;
  widgetForm!: FormGroup;
  formLoaded: boolean = false;
  maxDate: Date | null = null;

  widgetType = [
    {
      key: '0',
      label: 'Live',
      data: 'live',
    },
    {
      key: '1',
      label: 'History',
      data: 'history',
    },
  ];
  devices = [];
  deviceTags = [];

  constructor(
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private fb: FormBuilder,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.widgetForm = this.fb.group({
      widget_name: ['', Validators.required],
      widget_type: [
        {
          key: '0',
          label: 'Live',
          data: 'live',
        },
        Validators.required,
      ],
      device_id: ['', Validators.required],
      selected_device: [{ value: '', disabled: true }],
      tags: ['', Validators.required],
      from_time: [{ value: '', disabled: true }],
      to_time: [{ value: '', disabled: true }],
    });

    this.serverFetch.fetchServer(null, 'AllDevices').subscribe({
      next: (response: any) => {
        const devices = response.body.data;
        this.devices = devices.map((item: any) => {
          return {
            key: item.id,
            label: item.device_name,
            data: { id: item.id, tags: item.tags, type: item['host']['type'] },
          };
        });
        this.formLoaded = true;
      },
      error: (error) => {
        this.msgService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
        });
      },
    });

    this.widgetForm
      .get('widget_type')
      ?.valueChanges.subscribe((widget_type: any) => {
        if (widget_type) {
          this.formLoaded = false;
          const from_time = this.widgetForm.get('from_time');
          const to_time = this.widgetForm.get('to_time');
          if (widget_type.data === 'live') {
            from_time?.disable();
            to_time?.disable();
            from_time?.clearValidators();
            to_time?.clearValidators();
          } else {
            from_time?.enable();
            to_time?.enable();
            from_time?.addValidators([Validators.required]);
            to_time?.addValidators([Validators.required]);
          }
          from_time?.updateValueAndValidity();
          to_time?.updateValueAndValidity();
          this.formLoaded = true;
        }
      });

    this.widgetForm.get('device_id')?.valueChanges.subscribe((device: any) => {
      if (device) {
        this.formLoaded = false;
        const tags = device['data']['tags'];
        this.widgetForm.patchValue({ selected_device: device['data']['type'] });
        this.deviceTags = tags.map((item: any, index: number) => {
          return {
            key: item.tag,
            label: item.tag_name,
            data: { tag: item.tag, id: item.id, tag_name: item.tag_name },
          };
        });
        this.formLoaded = true;
      }
    });

    this.widgetForm.get('from_time')?.valueChanges.subscribe((date: any) => {
      if (date) {
        this.maxDate = new Date(date);
        this.maxDate.setDate(this.maxDate.getDate() + 3);
      }
    });
  }

  widgetDialogue() {
    this.visibility = true;
  }

  cancelAddWidget() {
    this.serverFetch.cancelRequest();
    this.widgetForm.reset({
      device: '',
      tags: '',
      from_time: '',
      selected_device: '',
      to_time: '',
    });
    this.deviceTags = [];
    this.visibility = false;
  }

  onWidgetAdd() {
    this.formLoaded = false;
    const payload = this.widgetForm.getRawValue();
    delete payload.selected_device;
    payload.device_id = payload.device_id['key'];
    payload.widget_type = payload.widget_type['data'];
    payload.dashboard_id = this.dashboard_id;
    if (payload.widget_type === 'history') {
      payload.from_time = Math.floor(
        new Date(payload.from_time).getTime() / 1000
      );
      payload.to_time = Math.floor(new Date(payload.to_time).getTime() / 1000);
    } else {
      payload.from_time = 0;
      payload.to_time = 0;
    }
    this.serverFetch.fetchServer(payload, 'AddWidget').subscribe({
      next: (response: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
        this.visibility = false;
        this.formLoaded = true;
        this.cancelAddWidget();
        this.refreshDashboard.emit();
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
