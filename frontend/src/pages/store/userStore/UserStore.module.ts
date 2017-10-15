import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserStorePage} from './UserStore';

@NgModule({
  declarations: [
    UserStorePage,
  ],
  imports: [
    IonicPageModule.forChild(UserStorePage),
  ],
})
export class StorePageModule {}
