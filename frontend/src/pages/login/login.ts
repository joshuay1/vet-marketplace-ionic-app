import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User} from "../../model/user";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { OwnerHomePage } from "../home/ownerHome/ownerHome";
import { VetHomePage} from "../home/vetHome/vetHome";
import { UserInfo } from "../../model/user";
import { RedirectPage } from "../redirect/redirect";
import { Storage } from '@ionic/storage';
import { OfflinePage } from './offline';
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
    private db: AngularFireDatabase,
    private storage : Storage) {
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
            this.storage.set("userType", userType).then(result=>{
              if(userType == "User"|| userType == "Vet"){
                
                this.navCtrl.push(RedirectPage, {
                  userType: userType
                })
              }
            }).catch(error=>{
              
              let alert = this.alertCtrl.create({
                title: 'Error',
                message: error,
                buttons: ['OK']
              });
                alert.present();

            });

            
          
          })
      })
      .catch(err =>{
        if(err["code"] == "auth/network-request-failed"){
          console.log("failed to login, network connection problem");
          let alert = this.alertCtrl.create({
            title: 'Network Connection Problem',
            message: "Press Offline Data to see Current Appointments offline",
            buttons: [
              {
                text: 'Back',
                role: 'back',
                handler: () => {
                  console.log('Back clicked');
                  return true;
                }
              },
              {
                text: 'Offline Data',
                handler: () => {
                  console.log('Oflline Persistency clicked');
                  this.getOfflineData();
                  return true;
                }
              }
            ]
          })
          alert.present();
          
        }else{

          let alert = this.alertCtrl.create({
            title: 'Error',
            message: err.message,
            buttons: ['OK']
          });
            alert.present();
            
        

        }
      });
        

        
    console.log("here");
  }

  registerVet() {

      this.navCtrl.push('RegisterOwnerPage', { UserType: "Vet" });
  }
  registerOwner() {
      this.navCtrl.push('RegisterOwnerPage', { UserType: "User" });
  }

  getOfflineData(){
    this.storage.get("userType").then(result=>{
      var userType = result;

      console.log("usertype data stored = "+ userType);
      if(userType == null){
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: "You have not log in before. No Data Found",
          buttons: ['OK']
        });
          alert.present();
      }else{
        this.navCtrl.push(OfflinePage,{"userType": userType});
      }
    }).catch(error=>{
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: "You have not log in before. No Data Found",
        buttons: ['OK']
      });
        alert.present();
    })
   
    
  }

}
