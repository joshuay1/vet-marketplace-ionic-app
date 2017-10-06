import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterPetPage } from './registerPet';

@NgModule({
  declarations: [
    RegisterPetPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterPetPage),
  ],
})
export class RegisterPetPageModule {}
