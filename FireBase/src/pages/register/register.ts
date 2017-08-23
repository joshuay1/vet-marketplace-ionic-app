import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase} from 'angularfire2/database';
import { User, UserInfo } from "../../model/user";
import { HomePage } from "../home/home";
/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  user = {} as User;
  userInfo = {} as UserInfo;
  dobOptions;
  yearOptions;
  loading;

  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private db :AngularFireDatabase) {
      this.setDobOptions();
      this.setYearOptions();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  async register(user: User) {
      this.afAuth.auth.createUserWithEmailAndPassword(user.email,user.password)
      .then(auth =>{
        if(this.userInfo.authkey!= null){
          this.userInfo.userType = "Vet";
          this.userInfo.authkey = null;
        }else{
          this.userInfo.userType = "User";
        }
        this.db.object(`users/${auth.uid}`).set(this.userInfo);
        this.navCtrl.setRoot(HomePage);

      })
      .catch(err =>{
        // Handle error
        let alert = this.alertCtrl.create({
        title: 'Error',
        message: err.message,
        buttons: ['OK']
      });
        alert.present();
      })
  
  }

  setDobOptions(){
    this.dobOptions = [
      '01','02','03','04','05','06','07','08','09','10','11','12'
    ]
  }

  setYearOptions(){
    var initialYear = 1945;
    this.yearOptions= [];
    for(var i = initialYear; i< 2017 ; i++){
      this.yearOptions.push(i);
    }
  }


  

}
