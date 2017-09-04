import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase} from 'angularfire2/database';
import { User, UserInfo } from "../../../model/user";
import { VetHomePage } from "../../home/vetHome/vetHome";
import { FormGroup ,FormBuilder,Validators} from "@angular/forms";
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
export class RegisterVetPage {
  [x: string]: any;

  user = {} as User;
  userInfo = {} as UserInfo;
  loading;
  registerForm: FormGroup;

  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private db :AngularFireDatabase,
    private builder: FormBuilder) {
      this.registerForm = builder.group({
        'email' : ['',Validators.compose([Validators.required,Validators.minLength(5),Validators.email])],
        'password':['',Validators.compose([Validators.required,Validators.minLength(8)])],
        'repassword':['',Validators.compose([Validators.required,Validators.minLength(8)])],
        'auth':[],
        'first-name': ['',Validators.required],
        'last-name': ['',Validators.required],
        'dob': ['',Validators.required]
      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  async register(user: User) {
    if(this.validate()){
      this.afAuth.auth.createUserWithEmailAndPassword(user.email,user.password)
      .then(auth =>{
        console.log(this.userInfo.authkey);
        if(this.userInfo.authkey){
          this.userInfo.userType = "Vet";
          this.userInfo.authkey = null;
        }else{
          this.userInfo.userType = "User";
          this.userInfo.authkey = null;
        }
        console.log(this.userInfo.authkey);
        console.log(this.userInfo.userType);
        this.db.object(`users/${auth.uid}`).set(this.userInfo);
        this.navCtrl.setRoot(VetHomePage);

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

  validate(): boolean{
    // figure out the error message
    let errorMsg = '';
    
        // validate each field
    let control = this.registerForm.controls['email'];
    if (!control.valid) {
      if (control.errors['required']) {
          errorMsg = 'Email cannot be empty';
      } else if (control.errors['minlength']) {
          errorMsg = 'Email must at least be 5 characters';
     } else if (control.errors['email']){
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
    }

    control = this.registerForm.controls['first-name'];
    if (!control.valid) {
      if (control.errors['required']) {
          errorMsg = 'First name cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
     }

     control = this.registerForm.controls['auth'];
     if (!control.valid) {
       errorMsg = "auth error";
       this.createAlert(errorMsg);
       return false;
      }

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

  createAlert(msg : string){
    let alert = this.alertCtrl.create({
      message :msg,
      buttons: ['OK']
    });
    alert.present();
  }


  

}
