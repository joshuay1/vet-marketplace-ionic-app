import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase} from 'angularfire2/database';
import {PetInfo } from "../../model/pet";
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


  async register(petInfo: PetInfo) {
    if(this.validate()){
      
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

  postRequest(info : PetInfo, id: string ){
    var headers = new Headers();
    headers.append('Content-Type','application/json');
    


    /*OLD PARAM
    var param = "userid="+id+"&firstname="+info.firstname+"&lastname="+info.lastname+"&dob="+info.dob
    +"&userType="+info.userType+"&streetnumber="+info.streetnumber+"&streetname="+info.streetname
    +"&suburb="+info.suburb+"&state="+info.state+"&postcode="+info.postcode+"&country="+info.country;*/

    var body = JSON.stringify({
      userid: id,
      petname : info.petname,
      animalType: info.animaltype,
      dob : info.dob,
      breed: info.breed,      
    });

    this.afAuth.auth.currentUser.getToken(true)
    .then(token =>{
      var param = "token="+ token;
      let options = new RequestOptions({headers: headers,params:param});
      var url =  this.apiUrl + "postProfile";

      console.log("//////////API Post///////////////////");
      console.log("postParams+ = "+param);
      console.log("body = "+ body);
      console.log("url = "+ url);

      this.http.post(url ,body , options)
      .subscribe(result=>{
        var response = result.json();
        console.log("success="+ JSON.stringify(response));
        var val = response.response;
        if(val === "success"){
          console.log ("storing data success");
          console.log ("///////////////API POST end///////////");
        }else{
          console.log("storing data failed, error = " + response.errorMessage);
          console.log ("///////////////API POST end///////////");
        }
      }
      ,error =>{
      console.log("error="+error);
  
    }); 
    });

    



    
    
    
    
  }


  

}
