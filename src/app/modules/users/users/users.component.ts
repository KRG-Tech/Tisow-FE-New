import { Component, OnInit } from '@angular/core';
import { ColDef, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';
import { TableBtnComponent } from '../../templates/table-btn/table-btn.component';

@Component({
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;

  rowData: [] = [];
  colDefs: ColDef[] = [
    { field: 'id', hide: true },
    {
      field: 'first_name',
      headerName: 'First Name',
      tooltipField: 'first_name',
    },
    {
      field: 'second_name',
      headerName: 'Second Name',
      tooltipField: 'second_name',
    },
    { field: 'email', headerName: 'Email', tooltipField: 'email' },
    { field: 'role', headerName: 'Role', tooltipField: 'role' },
    { field: 'rule', headerName: 'Rule', tooltipField: 'rule' },
    {
      field: 'created_on',
      headerName: 'Added On',
      floatingFilter: false,
      filter: false,
    },
    {
      headerName: 'Action',
      cellRenderer: TableBtnComponent,
      floatingFilter: false,
      filter: false,
      cellRendererParams: {
        buttonParams: {
          api: 'DeleteUser',
          buttonType: 'danger',
          label: 'Delete User',
          icon: 'pi pi-trash',
        },
      },
    },
  ];
  gridApi: any;
  gridOptions = <GridOptions>{
    columnDefs: this.colDefs,
    defaultColDef: <ColDef>{
      sortable: true,
      filter: true,
      floatingFilter: true,
    },
    tooltipHideDelay: 2000,
    tooltipShowDelay: 0,
    enableCellTextSelection: true,
  };
  userRoles = [
    {
      key: '0',
      label: 'Admin',
      data: 'admin',
    },
    {
      key: '1',
      label: 'Engineer',
      data: 'engineer',
    },
  ];
  rules = [
    {
      key: '0',
      label: 'ReadOnly',
      data: 'readonly',
    },
    {
      key: '1',
      label: 'Write',
      data: 'write',
    },
  ];
  addUserView: boolean = false;
  constructor(
    public themeServ: DynamicThemeService,
    private serverFetch: DataFetcherService,
    private msgService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      second_name: [''],
      email: ['', [Validators.required, Validators.email]],
      role: [
        {
          key: '1',
          label: 'Engineer',
          data: 'engineer',
        },
        [Validators.required],
      ],
      rule: [
        {
          key: '1',
          label: 'ReadOnly',
          data: 'readonly',
        },
        [Validators.required],
      ],
      password: ['admin', [Validators.required]],
    });
    this.fetchUsers();
  }

  onGridready(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  fetchUsers() {
    this.serverFetch.fetchServer(null, 'Users').subscribe({
      next: (response: any) => {
        this.rowData = response.body.data;
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

  showAddUserDialog() {
    this.addUserView = true;
  }

  addUser() {
    if (this.userForm.valid) {
      const payload = this.userForm.getRawValue();
      payload.role = payload['role']['data'];
      payload.rule = payload['rule']['data'];
      this.serverFetch.fetchServer(payload, 'AddUser').subscribe({
        next: (response: any) => {
          this.addUserView = false;
          this.msgService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.body.msg,
          });
          this.cancelAddUser();
          window.location.reload();
        },
        error: (error) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
      });
    } else {
      this.msgService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Fill all required fields',
      });
    }
  }

  cancelAddUser() {
    this.serverFetch.cancelRequest();
    this.userForm.reset({
      role: {
        key: '1',
        label: 'Engineer',
        data: 'engineer',
      },
      password: 'admin',
      rule: {
        key: '0',
        label: 'ReadOnly',
        data: 'readonly',
      },
    });
    this.addUserView = false;
  }
}
