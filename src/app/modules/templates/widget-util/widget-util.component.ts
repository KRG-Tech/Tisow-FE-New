import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { WebsocketServiceService } from '../../../services/websocket-service/websocket-service.service';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
import { MessageService } from 'primeng/api';
import { formatTimestamp } from '../../../common_functions/helper_functions';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-widget-util',
  templateUrl: './widget-util.component.html',
  styleUrl: './widget-util.component.css',
})
export class WidgetUtilComponent implements OnInit, OnDestroy {
  @Output() refreshDashboard: EventEmitter<void> = new EventEmitter<void>();
  @Input() data!: { [key: string]: any };
  widgetRowData: any;
  maxWidget: boolean = false;
  widgetName: string = '';
  columnDefs: ColDef[] = [];
  lastFetched = '';
  excelexported: boolean = true;
  gridApi!: GridApi;
  tableHeight: string = 'h-8rem';
  widgetStatus: 'danger' | 'warning' | 'success' = 'danger';
  gridOptions = <GridOptions>{
    columnDefs: this.columnDefs,
    defaultColDef: <ColDef>{
      sortable: false,
      filter: false,
      floatingFilter: false,
    },
    tooltipHideDelay: 3000,
    tooltipShowDelay: 0,
    enableCellTextSelection: true,
  };

  constructor(
    private wsService: WebsocketServiceService,
    private serverfetch: DataFetcherService,
    private msgService: MessageService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.columnDefs = this.data['tags'].map((item: any) => {
      return {
        field:
          this.data['device']['host']['type'] === 'bacnet'
            ? `${item['tag']}-${item['id']}`
            : item['tag'],
        headerName: item['tag_name'].toUpperCase(),
        headerTooltip: item['tag_name'].toUpperCase(),
        tooltipField: item['tag'],
      };
    });
    this.widgetName = this.data['name'];
    if (this.data['widget_type'] == 'live') {
      this.wsService.connect(this.data['device']['mac']);
      const getInitData = JSON.stringify({
        id: this.data['device']['id'],
        msg: 'GetLiveData',
      });
      setTimeout(() => {
        this.wsService.sendMessage(getInitData);
      }, 2000);
      this.wsService.onMessage().subscribe((msg) => {
        const parsedMsg = JSON.parse(msg);
        if (parsedMsg['mac'] == this.data['device']['mac']) {
          const data: { [key: string]: any } = parsedMsg['data'].reduce(
            (acc: { [key: string]: any }, item: { [key: string]: any }) => {
              const colName =
                this.data['device']['host']['type'] === 'bacnet'
                  ? `${item['tag']}-${item['id']}`
                  : item['tag'];
              acc[colName] = item['value'];
              return acc;
            },
            {}
          );
          this.widgetRowData = [data];
          this.lastFetched = formatTimestamp(parsedMsg['timestamp']);
          this.widgetStatus =
            parsedMsg['status'] == 'active' ? 'success' : 'danger';
          this.gridOptions.domLayout = 'autoHeight';
        }
      });
    } else {
      this.tableHeight = 'h-15rem';
      this.widgetStatus = 'warning';
      this.columnDefs.unshift({
        field: 'timestamp',
        headerName: 'TIMESTAMP',
        sortable: false,
        sort: 'asc',
        comparator: (date1: string, date2: string) => {
          const d1 = new Date(date1).getTime();
          const d2 = new Date(date2).getTime();
          if (d1 < d2) return -1;
          if (d1 > d2) return 1;
          return 0;
        },
      });
      const payload = {
        device_id: this.data['device']['id'],
        widget_name: this.data['name'],
        from_time: this.data['from_time'],
        to_time: this.data['to_time'],
      };
      this.serverfetch.fetchServer(payload, 'HistoryData').subscribe({
        next: (response: any) => {
          this.widgetRowData = response.body.data;
          if (this.widgetRowData.length > 0) {
            const from_time = this.widgetRowData[0]['timestamp'];
            const to_time = this.widgetRowData.pop()['timestamp'];
            this.lastFetched = `${from_time} to ${to_time}`;
          }
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

  ngOnDestroy(): void {
    this.wsService.closeConnection();
  }

  onMaxWidget() {
    this.maxWidget = true;
  }

  onGridReady(event: any) {
    this.gridApi = event.api;
    if (this.columnDefs.length <= 2) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  onWidgetDelete() {
    const payload = {
      id: this.data['id'],
      widget_name: this.widgetName,
    };
    this.serverfetch.fetchServer(payload, 'DeleteWidget').subscribe({
      next: (response: any) => {
        this.msgService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.body.msg,
        });
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

  onExportData() {
    this.excelexported = false;
    this.gridApi.exportDataAsCsv({
      fileName: `${this.data['device']['device_name']}_${this.lastFetched}`,
    });
    this.excelexported = true;
  }
}
