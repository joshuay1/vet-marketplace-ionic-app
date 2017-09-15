import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OwnerHomePage } from "../home/ownerHome/ownerHome";
import { VetHomePage } from '../home/vetHome/vetHome';
import { User, UserInfo } from "../../model/user";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

/**
 * Generated class for the RedirectPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-redirect',
  templateUrl: 'redirect.html',
})
export class RedirectPage {
    userType: String;
    constructor(public navCtrl: NavController,
        public navParams: NavParams, private afAuth: AngularFireAuth,
        private db: AngularFireDatabase) {
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad RedirectPage');
  }


  redirect() {
      this.userType = this.navParams.get("userType");
      console.log(this.userType);
      if (this.userType == 'User') {
          console.log("redirecting as user");
          this.navCtrl.setRoot(OwnerHomePage);
      }
      if (this.userType == 'Vet') {
          //if is validated
          console.log("redirecting as vet");
          this.navCtrl.setRoot(VetHomePage);
      }

  }

}
