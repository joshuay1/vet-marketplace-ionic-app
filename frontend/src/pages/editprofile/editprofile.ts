import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RequestOptions, Http, Headers } from "@angular/http";
import { ProfilePage } from "../profile/profile";
import { HttpServiceProvider } from "../../providers/http-service/http-service";

/**
 * Generated class for the EditprofilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})
export class EditProfilePage {
  userInfo = {} as UserInfo;
  profileData: FirebaseObjectObservable<UserInfo>;
  loading; registerForm: FormGroup;
  uid: String;
  private apiUrl = 'http://115.146.86.193:8080/';
  result:String;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private builder: FormBuilder,
    private http: Http,
    private httpProviders : HttpServiceProvider) {

    /*this.db.list(`users/${data.uid}`).subscribe(snapshots =>{
       console.log ("snapshots=" +snapshots);
       console.log("value = "+ snapshots.values);
       /*snapshots.forEach(snapshot=>{
         console.log(" key = "+Object.values());
         //this.profileData.push(Object.keys(snapshot));
       });*/
    //console.log("ProfileData = "+ this.profileData);
    /*snapshots.forEach(snapshot=>{
      //console.log("snapshot = "+snapshot.key()) ;
      snapshot.array.forEach(element => {
        console.log(element);
      });
      //console.log(snapshot.val());
      //this.profileData = snapshot.val();
    })*/
    this.afAuth.authState.subscribe(data => {
      this.uid = data.uid;
      console.log("uid = " + this.uid);
      this.profileData = this.db.object(`users/` + this.uid/*,{preserveSnapshot: true}*/);
      this.profileData.forEach(snapshot => {

        this.registerForm = builder.group({
          'auth': [],
          'first-name': [snapshot.firstname],
          'last-name': [snapshot.lastname],
          'dob': [snapshot.dob],
          'streetname': [snapshot.streetname],
          'streetnumber': [snapshot.streetnumber],
          'suburb': [snapshot.suburb],
          'state': [snapshot.state],
          'postcode': [snapshot.postcode],
          'country': [snapshot.country]
          /*console.log ("snapshots=" +snapshots);
          console.log("value = "+ snapshots.values);
          snapshots.forEach(snapshot=>{
            console.log("snapshot = "+snapshot.key+", values =" + snapshot.val()) ;
          });*/
        });
      })

      console.log(this.profileData);
    });
  }

  async update(){
  
    if(this.validate()){
      this.userInfo.userid = this.afAuth.auth.currentUser.uid;
      this.httpProviders.httpPost(this.apiUrl+"profileUpdate",JSON.stringify(this.userInfo))
      .then(result=>{
        console.log("get result here");
        var res = result.response;
        if(res =="success"){
          this.navCtrl.pop();
        }
      }).catch(err=>{
        console.log("catching error here");
        let alert = this.alertCtrl.create({
          title: 'Error',
          message : err,
          buttons : ['OK']
        });
        alert.present();
      })
      
    }
  }
  

  validate(): boolean {
    // figure out the error message
    let errorMsg = '';
/*
    // validate each field
    let control = this.registerForm.controls['email'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Email cannot be empty';
      } else if (control.errors['minlength']) {
        errorMsg = 'Email must at least be 5 characters';
      } else if (control.errors['email']) {
        errorMsg = "Not a valid email format";
      }
      this.createAlert(errorMsg);
      return false;
    }

    control = this.registerForm.controls['password'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Password cannot be empty';
      } else if (control.errors['minlength']) {
        errorMsg = 'Password must have at least 8 characters';
      }
      this.createAlert(errorMsg);
      return false;
    }*/

    let control = this.registerForm.controls['first-name'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'First name cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }

/*
    control = this.registerForm.controls['auth'];
    if (!control.valid) {
      errorMsg = "auth error";
      this.createAlert(errorMsg);
      return false;
    }
    */
    control = this.registerForm.controls['last-name'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Last name cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }

    control = this.registerForm.controls['dob'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Date cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }


    return true;

  }

  createAlert(msg: string) {
    let alert = this.alertCtrl.create({
      message: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  
}
