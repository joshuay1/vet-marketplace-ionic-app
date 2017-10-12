import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PictureEditPage } from './pictureEdit';

@NgModule({
  declarations: [
    PictureEditPage,
  ],
  imports: [
    IonicPageModule.forChild(PictureEditPage),
  ],
})
export class PictureEditModule {}
