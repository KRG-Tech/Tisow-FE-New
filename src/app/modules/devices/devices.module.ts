import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControllersComponent } from './views/host-devices/controllers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ViewControllerComponent } from './views/view-devices/view-controller.component';
import { FormControlComponent } from './views/form-control/form-control.component';
import { AddBacnetComponent } from './forms/bacnet/add-bacnet-host/add-bacnet.component';
import { AddBacnetDeviceComponent } from './forms/bacnet/add-bacnet-device/add-bacnet-device.component';
import { AddMbusHostComponent } from './forms/mbus/add-mbus-host/add-mbus-host.component';
import { AddMbusDeviceComponent } from './forms/mbus/add-mbus-device/add-mbus-device.component';
import { AddModbusDeviceComponent } from './forms/modbus/add-modbus-device/add-modbus-device.component';
import { AddModbusHostComponent } from './forms/modbus/add-modbus-host/add-modbus-host.component';
import { ThemeModule } from '../../../themes/theme.module';
import { DeviceSetupComponent } from '../devices/views/device-setup/device-setup.component';

@NgModule({
  declarations: [
    ControllersComponent,
    AddBacnetComponent,
    AddBacnetDeviceComponent,
    ViewControllerComponent,
    FormControlComponent,
    AddMbusHostComponent,
    AddMbusDeviceComponent,
    AddModbusDeviceComponent,
    AddModbusHostComponent,
    DeviceSetupComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    ReactiveFormsModule,
    AgGridAngular,
    AgGridModule,
    FormsModule,
  ],
  exports: [
    ControllersComponent,
    AddBacnetComponent,
    AddBacnetDeviceComponent,
    ViewControllerComponent,
    DeviceSetupComponent,
  ],
})
export class DevicesModule {}
