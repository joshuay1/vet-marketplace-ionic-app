import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, AlertController} from 'ionic-angular';
import {OwnerHomePage} from "../home/ownerHome/ownerHome";
import {VetHomePage} from '../home/vetHome/vetHome';
import {User, UserInfo} from "../../model/user";
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import { HttpServiceProvider } from '../../providers/http-service/http-service';

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
  private userType: String;
  private vetKey: String;
  private loading: any;
  private isVerifiedVet: any;
  private userid: string;
  private apiUrl = 'http://115.146.86.193:8080/';
  private notAuthorised = null;

  constructor(public navCtrl: NavController,
              public navParams: NavParams, private afAuth: AngularFireAuth,
              private db: AngularFireDatabase,
              private loadingCtrl: LoadingController,
              private httpProviders : HttpServiceProvider,
              private alertCtrl : AlertController) {
    this.isVerifiedVet = this.navParams.get("isVerifiedVet");
    console.log("is Verified Vet = "+ this.isVerifiedVet);
    this.loading = this.loadingCtrl.create({
      content: 'Logging In'
    });
    this.loading.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RedirectPage');
    this.redirect();
  }


  redirect() {
    this.userType = this.navParams.get("userType");
    console.log(this.userType);
    if (this.userType == 'User') {
      console.log("redirecting as user");
      this.loading.dismiss();
      this.navCtrl.setRoot(OwnerHomePage);

    }
    if (this.userType == 'Vet') {
      //if is validated
      this.userid = this.afAuth.auth.currentUser.uid;
      console.log("uid = " + this.userid);
      if (this.isVerifiedVet) {
        console.log("redirecting as vet");
        this.loading.dismiss();
        this.navCtrl.setRoot(VetHomePage);

      }
      else {
        var show = document.getElementById("authKey");
        this.notAuthorised = true;
        this.loading.dismiss();
          //make things seen!! ------------------- TODO
      }
    }

  }

  verifyVet() {
    console.log(this.vetKey);
    var body = {userid : this.userid,authkey : this.vetKey };
    this.httpProviders.httpPost(this.apiUrl+"verify", JSON.stringify(body))
    .then(result=>{
      console.log("get result here");
      var res = result.response;
      if(res =="success"){
        console.log("get result here");
        this.navCtrl.setRoot(VetHomePage);
      }
    }).catch(err=>{
      console.log("catchin error here");
      let alert = this.alertCtrl.create({
        title: 'Error',
        message : err,
        buttons : ['OK']
      });
      alert.present();
    });
  }

  back() {
    this.navCtrl.pop();
  }

}
