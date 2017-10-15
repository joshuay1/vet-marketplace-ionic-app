import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditPetPage } from './editpet';

@NgModule({
  declarations: [
    EditPetPage,
  ],
  imports: [
    IonicPageModule.forChild(EditPetPage),
  ],
})
export class EditProfilePageModule {}