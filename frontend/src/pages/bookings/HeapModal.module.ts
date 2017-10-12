import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HeapModal } from './HeapModal';

@NgModule({
  declarations: [
    HeapModal
  ],
  imports: [
    IonicPageModule.forChild(HeapModal),
  ],
})
export class HeapModalModule {}