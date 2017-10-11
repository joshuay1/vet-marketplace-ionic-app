import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VetStorePage } from './VetStore';

@NgModule({
  declarations: [
    VetStorePage,
  ],
  imports: [
    IonicPageModule.forChild(VetStorePage),
  ],
})
export class VetStorePageModule {}
