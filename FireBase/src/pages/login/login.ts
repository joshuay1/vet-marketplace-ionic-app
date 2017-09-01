import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { User } from "../../model/user";
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from "../home/home";
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
  
  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController,
     public navParams: NavParams,
    private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  async login(user: User) {
      this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password)
      .then(auth => {
        this.navCtrl.setRoot(HomePage);
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
