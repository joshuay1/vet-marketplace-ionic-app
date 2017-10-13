import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { PetInfo } from "../../model/pet";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RequestOptions, Http, Headers } from "@angular/http";
import { HttpServiceProvider } from "../../providers/http-service/http-service";
import { PetPage } from "../pet/pet";

/**
 * Generated class for the EditprofilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editpet',
  templateUrl: 'editpet.html',
})
export class EditPetPage {
  petInfo = {};
  petData: FirebaseObjectObservable<PetInfo>;
  loading; 
  petForm: FormGroup;
  petId: string;
  private apiUrl = 'http://115.146.86.193:8080/';
  result:string;
  petName:string;
  animalType:string;
  animalBreed:string;
  dob:Date;

  constructor(public viewCtrl: ViewController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private builder: FormBuilder,
    private http: Http,
    private httpProviders : HttpServiceProvider) {
    this.afAuth.authState.subscribe(data => {
      this.petId = navParams.get("petId");
      console.log("PetID:"+this.petId)
      this.petData = this.db.object(`pets/` + this.petId);
      this.petData.forEach(snapshot => {       
        this.petForm = builder.group({
          'petName': [snapshot.petName],
          'animalType': [snapshot.animalType],
          'dob': [snapshot.dob],
          'animalBreed': [snapshot.animalBreed],
          });   
          this.petName = snapshot.petName;
          this.dob = snapshot.dob;
          this.animalType = snapshot.animalType;
          this.animalBreed = snapshot.animalBreed;     
        })
        console.log(this.petData);        
      });
  }

  async update(){
  
    if(this.validate()){
      this.petInfo["petId"] = this.petId;
      console.log(this.petInfo["petId"]+"***");      
      if(this.petInfo["petname"]==null){
        this.petInfo["petname"] = this.petName;
        console.log(this.petInfo["petname"]+"***");
      }
      if(this.petInfo["dob"]==null){
        this.petInfo["dob"] = this.dob;
        console.log(this.petInfo["dob"]+"***");
      }
      if(this.petInfo["breed"]==null){
        this.petInfo["breed"] = this.animalBreed;
        console.log(this.petInfo["breed"]+"***");
      }
      if(this.petInfo["animalType"]==null){
        this.petInfo["animalType"] = this.animalType;
        console.log(this.petInfo["animalType"]+"***");
      }
        }
        
         console.log(JSON.stringify(this.petInfo));
      this.httpProviders.httpPost(this.apiUrl+"petProfileUpdate",JSON.stringify(this.petInfo))
      .then(result=>{
        console.log("get result here");
        var res = result.response;
        if(res =="success"){
          console.log("get result here");
          this.viewCtrl.dismiss();//.catch(() => console.log('view was not poped'));;
        }
      }).catch(err=>{
        console.log("catchin error here");
        let alert = this.alertCtrl.create({
          title: 'Error',
          message : err,
          buttons : ['OK']
        });
        alert.present();
      })
      
    }
  

  validate(): boolean {
    // figure out the error message
    let errorMsg = 'Error';

    let control = this.petForm.controls['petName'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Pet name cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }

    control = this.petForm.controls['animalType'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'animal Type cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }

    control = this.petForm.controls['dob'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Date cannot be empty';
      }
      this.createAlert(errorMsg);
      return false;
    }

    
    control = this.petForm.controls['animalBreed'];
    if (!control.valid) {
      if (control.errors['required']) {
        errorMsg = 'Animal Breed cannot be empty';
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
