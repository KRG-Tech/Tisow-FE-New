import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { timer } from 'rxjs';
import { DataFetcherService } from 'src/app/services/data-fetcher/data-fetcher.service';

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrl: './form-control.component.css',
})
export class FormControlComponent implements OnInit {
  @Input() formType!: string;
  @Output() refresh: EventEmitter<void> = new EventEmitter<void>();
  @Input() host_id!: any;
  @Input() visibility: boolean = false;
  @Input() editProp: any = { edit: false };
  @Input() selectedProtocol: 'bacnet' | 'modbus' | 'mbus' | '' = '';
  protocolTypes: MenuItem[] | undefined;

  constructor(
    private readonly serverFetch: DataFetcherService,
    private readonly msgService: MessageService
  ) {}

  ngOnInit(): void {
    this.protocolTypes = [
      {
        label: 'Bacnet',
        icon: 'pi pi-shield',
        command: () => {
          this.selectedProtocol = 'bacnet';
          this.visibility = true;
        },
      },
      {
        label: 'Mbus',
        icon: 'pi pi-shield',
        command: () => {
          this.selectedProtocol = 'mbus';
          this.visibility = true;
        },
      },
      {
        label: 'Modbus',
        icon: 'pi pi-shield',
        items: [
          {
            label: 'Modbus TCP',
            icon: 'pi pi-microchip',
          },
          {
            label: 'Modbus RTU',
            icon: 'pi pi-microchip',
            command: () => {
              this.selectedProtocol = 'modbus';
              this.visibility = true;
            },
          },
        ],
      },
    ];
  }
  refreshPage() {
    this.refresh.emit();
  }
  closeDialogue() {
    this.visibility = false;
    this.refreshPage();
  }

  editHostDevice(payload: any) {
    let url = '';
    if (this.host_id) {
      payload.id = this.editProp.id;
      url = 'EditHost';
    } else {
      url = 'EditDevice';
    }
    timer(100).subscribe(() => {
      this.serverFetch.fetchServer(payload, url).subscribe({
        next: (response: any) => {
          this.msgService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.body.msg,
          });
          window.location.href = window.location.href;
        },
        error: (error: any) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
    });
  }
}
