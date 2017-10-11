import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { PetPage} from "../pet/pet";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-profile',
    templateUrl: 'profile_Vet.html',
})
export class ProfileVetPage {
    profileData: FirebaseObjectObservable<UserInfo>;
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase) {
    }

    private userData = {
        uid: ""
    };

    ionViewDidLoad() {
        console.log("hello");
        this.afAuth.authState.subscribe(data => {
            this.profileData = this.db.object(`users/${data.uid}`);
            this.userData.uid = `${data.uid}`;
            console.log(this.userData.uid);
        });

    }
}
