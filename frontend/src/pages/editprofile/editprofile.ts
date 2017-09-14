import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RequestOptions, Http, Headers } from "@angular/http";
import { ProfilePage } from "../profile/profile";

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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private builder: FormBuilder,
    private http: Http) {

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
          'first-name': [snapshot.firstname,Validators.required],
          'last-name': [snapshot.lastname,Validators.required],
          'dob': [snapshot.dob,Validators.required],
          'streetname': [snapshot.streetname,Validators.required],
          'streetnumber': [snapshot.streetnumber,Validators.required],
          'suburb': [snapshot.suburb,Validators.required],
          'state': [snapshot.state,Validators.required],
          'postcode': [snapshot.postcode,Validators.required],
          'country': [snapshot.country,Validators.required]
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
      this.postRequest(this.userInfo,this.uid);
      console.log("life is hard.");
      this.navCtrl.pop;
    }
  }
  /*
    catch(err=>{
      // Handle error
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: err.message,
        buttons: ['OK']
      });
        alert.present();
      })

    }
    */
  
  /*async register(user: User) {
    if(this.validate()){
      this.afAuth.auth.createUserWithEmailAndPassword(user.email,user.password)
      .then(auth =>{
        console.log(this.userInfo.userType);
        
        //REST Connection to Server
        this.postRequest(this.userInfo, auth.uid);
        this.navCtrl.setRoot(ProfilePage);
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

  
  }
*/

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

  postRequest(info: UserInfo, id: String) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');



    /*OLD PARAM
    var param = "userid="+id+"&firstname="+info.firstname+"&lastname="+info.lastname+"&dob="+info.dob
    +"&userType="+info.userType+"&streetnumber="+info.streetnumber+"&streetname="+info.streetname
    +"&suburb="+info.suburb+"&state="+info.state+"&postcode="+info.postcode+"&country="+info.country;*/

    var body = JSON.stringify({
      userid: id,
      firstname: info.firstname,
      lastname: info.lastname,
      dob: info.dob,
      userType: info.userType,
      streetnumber: info.streetnumber,
      streetname: info.streetname,
      suburb: info.suburb,
      state: info.state,
      postcode: info.postcode,
      country: info.country
    });

    this.afAuth.auth.currentUser.getToken(true)
      .then(token => {
        var param = "token=" + token;
        let options = new RequestOptions({ headers: headers, params: param });
        var url = this.apiUrl + "profileUpdate";

        console.log("//////////API Post///////////////////");
        console.log("postParams+ = " + param);
        console.log("body = " + body);
        console.log("url = " + url);

        this.http.post(url, body, options)
          .subscribe(result => {
            var response = result.json();
            console.log("success=" + JSON.stringify(response));
            var val = response.response;
            if (val === "success") {
              console.log("storing data success");
              console.log("///////////////API POST end///////////");
            } else {
              console.log("storing data failed, error = " + response.errorMessage);
              console.log("///////////////API POST end///////////");
            }
          }
          , error => {
            console.log("error=" + error);

          });
      });




    }
  }
