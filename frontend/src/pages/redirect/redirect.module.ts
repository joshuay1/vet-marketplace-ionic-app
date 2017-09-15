import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RedirectPage } from './redirect';

@NgModule({
  declarations: [
    RedirectPage,
  ],
  imports: [
    IonicPageModule.forChild(RedirectPage),
  ],
})
export class RedirectPageModule {}
