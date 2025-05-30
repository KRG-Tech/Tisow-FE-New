import { Component, OnInit, ViewChild } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { DynamicThemeService } from '../../../services/dynamic-theme-service/dynamic-theme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataFetcherService } from '../../../services/data-fetcher/data-fetcher.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  navData: any[] = [];
  sidebarVisible: boolean = true;
  userData: any;
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
  addUserView: boolean = false;
  userForm!: FormGroup;
  settingsView: boolean = false;

  themeModeForm!: FormGroup;
  stateOptions: any[] = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    public navBarVisibility: DynamicThemeService,
    private fb: FormBuilder,
    private serverFetch: DataFetcherService,
    private msgService: MessageService
  ) {
    this.userData = this.auth.getUserDetails;
  }

  ngOnInit(): void {
    this.loadNavMenu();
    this.userForm = this.fb.group({
      first_name: [{ value: '', disabled: true }, Validators.required],
      second_name: [{ value: '', disabled: true }],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      role: [
        {
          value: {
            key: '1',
            label: 'Engineer',
            data: 'engineer',
          },
          disabled: true,
        },
        [Validators.required],
      ],
      password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      re_password: ['', [Validators.required]],
    });
    this.themeModeForm = this.fb.group({
      mode: [this.navBarVisibility.mode == 'dark' ? true : false],
    });

    this.themeModeForm.get('mode')?.valueChanges.subscribe((param) => {
      this.navBarVisibility.switchMode();
    });
  }

  loadNavMenu() {
    this.navData = [
      {
        icon: 'pi pi-chart-bar mr-2',
        label: 'DashBoard',
        routerLink: '/dashboard',
      },
      {
        icon: 'pi pi-server mr-2',
        label: 'Host Devices',
        routerLink: '/hosts',
      },
      // {
      //   label: 'Settings',
      //   icon: 'pi pi-cog mr-2',
      //   command: () => this.showSettings(),
      // },
      ...(this.auth.getUserDetails.is_admin
        ? [
            // {
            //   label: 'Users',
            //   icon: 'pi pi-users mr-2',
            //   routerLink: '/users',
            // },
          ]
        : []),
      // {
      //   label: 'Logout',
      //   icon: 'pi pi-sign-out mr-2',
      //   command: () => this.confirmLogoutAction(),
      // },
      { separator: true },
    ];
  }

  editUser() {
    if (this.userForm.valid) {
      const raw_payload = this.userForm.value;

      if (raw_payload['new_password'] === raw_payload['re_password']) {
        const payload = {
          id: this.userData.id,
          password: raw_payload.password,
          new_password: raw_payload.new_password,
        };
        this.serverFetch.fetchServer(payload, 'EditUser').subscribe({
          next: (response: any) => {
            this.addUserView = false;
            this.msgService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.body.msg,
            });
            this.userForm.reset();
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
          detail: 'New Password and Confirm Password are not matching',
        });
      }
    } else {
      this.msgService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Fill all required fields',
      });
    }
  }

  showAddUserDialog() {
    const userdata = this.auth.getUserDetails;
    const role =
      userdata['role'] == 'engineer'
        ? {
            key: '1',
            label: 'Engineer',
            data: 'engineer',
          }
        : {
            key: '0',
            label: 'Admin',
            data: 'admin',
          };
    this.userForm.patchValue({
      first_name: userdata['first_name'],
      second_name: userdata['second_name'],
      email: userdata['email'],
      role: role,
      password: '',
    });
    this.userForm.get('email')?.disable();
    this.addUserView = true;
  }

  cancelEditUser() {
    this.serverFetch.cancelRequest();
    this.userForm.reset();
    this.addUserView = false;
  }

  confirmLogoutAction() {
    sessionStorage.clear();
    this.router.navigate(['dashboard']);
  }

  showSettings() {
    this.settingsView = true;
  }
}
