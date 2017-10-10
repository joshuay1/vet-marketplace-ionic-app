import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VetBookingsPage } from './vetBookings';

@NgModule({
  declarations: [
    VetBookingsPage,
  ],
  imports: [
    IonicPageModule.forChild(VetBookingsPage),
  ],
})
export class BookingsPageModule {}
