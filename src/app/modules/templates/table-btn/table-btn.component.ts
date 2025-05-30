import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MessageService } from 'primeng/api';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';

@Component({
  selector: 'app-table--btn',
  template: `<div
    class="flex h-full  justfy-content-center"
    style="position: relative;bottom: 5px"
  >
    <p-button
      [icon]="this.buttonParams.icon"
      class="mr-2"
      size="small"
      [label]="this.buttonParams.label"
      [severity]="this.buttonParams.buttonType"
      [raised]="false"
      [outlined]="false"
      (onClick)="buttonClicked()"
    />
  </div>`,
})
export class TableBtnComponent implements ICellRendererAngularComp {
  param: any;
  buttonParams: any;
  constructor(
    private serverFetch: DataFetcherService,
    private msgService: MessageService
  ) {}

  agInit(params: ICellRendererParams): void {
    this.param = params;
    this.buttonParams = this.param.buttonParams;
  }
  refresh(params: ICellRendererParams) {
    return true;
  }
  buttonClicked() {
    const raw = this.param.node.data;
    const payload = { id: raw.id, email: raw.email };
    this.serverFetch.fetchServer(payload, this.buttonParams.api).subscribe({
      next: (response: any) => {
        this.param.api.applyTransaction({ remove: [this.param.node.data] });
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
  }
}
