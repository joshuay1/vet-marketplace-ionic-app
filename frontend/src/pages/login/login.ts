import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User} from "../../model/user";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { OwnerHomePage } from "../home/ownerHome/ownerHome";
import { VetHomePage} from "../home/vetHome/vetHome";
import { UserInfo } from "../../model/user";
import { RedirectPage } from "../redirect/redirect"
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user = {} as User;
  profileData : UserInfo;

  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController,
     public navParams: NavParams,
    private alertCtrl: AlertController,
    private db: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  async login(user: User) {
      this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password)
      .then(
        auth => {

          var uid = this.afAuth.auth.currentUser.uid;
          console.log(uid);
          this.db.database.ref('/users/'+uid).once('value',(snapshot)=>{
            this.profileData = snapshot.val();
            console.log(JSON.stringify(this.profileData));
            var userType = this.profileData.userType;

            if(userType == "User"|| userType == "Vet"){
              this.navCtrl.push(RedirectPage, {
                userType: userType
              })
            }
          
          })
      })
      .catch(err =>{
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: err.message,
          buttons: ['OK']
        });
          alert.present();
        })
    console.log("here");
  }

  registerVet() {

      this.navCtrl.push('RegisterOwnerPage', { UserType: "Vet" });
  }
  registerOwner() {
      this.navCtrl.push('RegisterOwnerPage', { UserType: "User" });
  }

}
