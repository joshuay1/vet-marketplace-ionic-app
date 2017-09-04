import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { User } from "../../model/user";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { OwnerHomePage } from "../home/ownerHome/ownerHome";
import { VetHomePage} from "../home/vetHome/vetHome";
import { UserInfo} from "../../model/user";
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
  profileData : FirebaseObjectObservable<UserInfo>;

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
          this.afAuth.authState.subscribe(data=>{
            
            this.profileData = this.db.object(`users/${data.uid}`)
            console.log("data User ID = " + data.uid);
            this.profileData.forEach(element => {
              if(element.userType == "User"){
                  console.log("FOUND USER");
                  this.navCtrl.setRoot(OwnerHomePage);
              }              
              else{
                console.log("Found Vet");
                this.navCtrl.setRoot(VetHomePage);
              }
            });
          });
      })
      .catch(err =>{
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: err.message,
          buttons: ['OK']
        });
          alert.present();
        })
  }

  registerVet() {
    this.navCtrl.push('RegisterVetPage');
  }
  registerOwner() {
      this.navCtrl.push('RegisterOwnerPage');
  }

}
