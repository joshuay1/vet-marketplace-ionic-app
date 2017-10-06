import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FindNearestVet } from './FindNearestVet';

@NgModule({
  declarations: [
    FindNearestVet
  ],
  imports: [
    IonicPageModule.forChild(FindNearestVet),
  ],
})
export class FindNearestVetModule{}
