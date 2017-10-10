import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase} from 'angularfire2/database';
import {PetInfo } from "../../model/pet";
import { OwnerHomePage } from "../home/ownerHome/ownerHome";
import {ProfilePage} from "../profile/profile";
import { FormGroup ,FormBuilder,Validators} from "@angular/forms";
import { RequestOptions, Http, Headers } from "@angular/http";
/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-registerPet',
  templateUrl: 'registerPet.html',
})
export class RegisterPetPage {
  [x: string]: any;
  private apiUrl = 'http://115.146.86.193:8080/';
  petInfo = {} as PetInfo;
  loading; registerForm: FormGroup;


  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private db :AngularFireDatabase,
    private builder: FormBuilder,
    private http: Http) {
      this.registerForm = builder.group({
        'petname': ['',Validators.required],
        'animalType': ['',Validators.required],
        'dob': ['',Validators.required],
        'breed':['',Validators.required],
      })
  }
  private userid = "";
  ionViewDidLoad() {
    this.userid = this.navParams.get("uid");
  }

  async register() {
    if(this.validate()){
      console.log("validated on register");
      console.log(this.userid+": getting user id from pet register page.");
      this.postRequest(this.petInfo,this.userid)
      console.log("finished post.")
      this.navCtrl.push(ProfilePage);
    }
  }

  validate(): boolean{
    // figure out the error message
    let errorMsg = '';

        // validate each field
    let control = this.registerForm.controls['petname'];

    control = this.registerForm.controls['petname'];
    if (!control.valid) {
      if (control.errors['required']) {
          errorMsg = 'Pet name cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
     }

     control = this.registerForm.controls['breed'];
     if (!control.valid) {
       if (control.errors['required']) {
           errorMsg = 'Breed cannot be empty. Enter "No" if not sure.';
       }
       this.createAlert(errorMsg);
       return false;
      }

     control = this.registerForm.controls['animalType'];
     if (!control.valid) {
       if (control.errors['required']) {
           errorMsg = 'Animal cannot be empty';
       }
       this.createAlert(errorMsg);
       return false;
      }

      control = this.registerForm.controls['dob'];
      if (!control.valid) {
        if (control.errors['required']) {
            errorMsg = 'Date of birth cannot be empty';
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

  postRequest(info : PetInfo, id: string ){
    var headers = new Headers();
    headers.append('Content-Type','application/json');

    var body = JSON.stringify({
      userId: this.userid,
      petname : info.petName,
      animalType: info.animaltype,
      dob : info.dob,
      breed: info.breed,
    });

    this.afAuth.auth.currentUser.getToken(true)
    .then(token =>{
      var param = "token="+ token;
      let options = new RequestOptions({headers: headers,params:param});
      var url =  this.apiUrl + "postPetProfile";

      console.log("//////////API Post///////////////////");
      console.log("postParams+ = "+param);
      console.log("body = "+ body);
      console.log("url = "+ url);
      console.log(this.http.post(url ,body , options));
      var promise = this.http.post(url ,body , options);
    });


  }




}
