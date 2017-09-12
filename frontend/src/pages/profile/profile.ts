import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { PetPage} from "../pet/pet";
import { EditProfilePage} from "../editprofile/editprofile";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  profileData : FirebaseObjectObservable<UserInfo>;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
            private afAuth: AngularFireAuth,
            private db : AngularFireDatabase) {
  }

  ionViewDidLoad() {
    this.afAuth.authState.subscribe(data=>{
      this.profileData = this.db.object(`users/${data.uid}`)
    });
  }


  accessPet() {
    this.navCtrl.push('PetPage');
  }

  editProfile() {
    this.navCtrl.push('EditProfilePage');
  }


}
