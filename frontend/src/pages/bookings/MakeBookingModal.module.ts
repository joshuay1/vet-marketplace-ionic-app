import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {CalendarPage} from "../calendar/calendar";
import {MakeBookingModal} from './MakeBookingModal';

@NgModule({
  declarations: [
    MakeBookingModal
  ],
  imports: [
    IonicPageModule.forChild(MakeBookingModal),
  ],
})
export class MakeBookingModalModule{}
