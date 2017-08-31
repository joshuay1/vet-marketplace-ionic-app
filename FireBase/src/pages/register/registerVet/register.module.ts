import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterVetPage } from './register';

@NgModule({
  declarations: [
    RegisterVetPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterVetPage),
  ],
})
export class RegisterPageModule {}
