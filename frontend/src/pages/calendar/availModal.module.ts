import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarPage } from './calendar';
import { AvailModal } from './availModal';

@NgModule({
  declarations: [
    AvailModal
  ],
  imports: [
    IonicPageModule.forChild(AvailModal),
  ],
})
export class AvailModalModule {}