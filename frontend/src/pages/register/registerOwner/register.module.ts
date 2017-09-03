import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterOwnerPage } from './register';

@NgModule({
  declarations: [
    RegisterOwnerPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterOwnerPage),
  ],
})
export class RegisterPageModule {}
