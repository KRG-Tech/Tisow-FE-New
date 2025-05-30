import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  constructor() {}
  private apis: { [key: string]: { [key: string]: any } } = {
    Login: { url: '/controller/login', method: 'POST' },
    Users: { url: '/controller/users', method: 'POST' },
    AddUser: { url: '/controller/users/add_user', method: 'POST' },
    DeleteUser: { url: '/controller/users/delete_user', method: 'POST' },
    EditUser: { url: '/controller/users/edit_user', method: 'POST' },
    GetBacnetDevices: {
      url: '/controller/devices/search/bacnet',
      method: 'POST',
    },
    AddDevice: {
      url: '/controller/devices/add_device',
      method: 'POST',
    },
    GetHosts: {
      url: '/controller/devices/get_hosts',
      method: 'POST',
    },
    DeleteHostDevice: {
      url: '/controller/devices/delete_host_device',
      method: 'POST',
    },
    GetDevices: {
      url: '/controller/devices/get_devices',
      method: 'POST',
    },
    EditHost: {
      url: '/controller/devices/edit_host',
      method: 'POST',
    },
    EditDevice: {
      url: '/controller/devices/edit_device',
      method: 'POST',
    },
    GetTags: {
      url: '/controller/devices/edit_device/tags',
      method: 'POST',
    },
    GetHostData: {
      url: '/controller/devices/host',
      method: 'POST',
    },
    AllDevices: {
      url: '/controller/dashboard/devices',
      method: 'POST',
    },
    AddWidget: {
      url: '/controller/dashboard/add_widget',
      method: 'POST',
    },
    DeleteWidget: {
      url: '/controller/dashboard/widgets/delete',
      method: 'POST',
    },
    Widgets: {
      url: '/controller/dashboard/widgets',
      method: 'POST',
    },
    HistoryData: {
      url: '/controller/dashboard/widgets/history',
      method: 'POST',
    },
    AddDashboard: {
      url: '/controller/dashboard/add_dashboard',
      method: 'POST',
    },
    Dashboards: {
      url: '/controller/dashboard/dashboards',
      method: 'POST',
    },
    GetMbusDevices: {
      url: '/controller/devices/search/mbus',
      method: 'POST',
    },
    UploadExcelFile: {
      url: '/controller/upload-devices-excel',
      method: 'POST',
      formatDate:true
    },
  };

  getApi(apiName: string): { [key: string]: any } {
    return this.apis[apiName];
  }
}
