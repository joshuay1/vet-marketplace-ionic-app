import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { PetPage} from "../pet/pet";
import { EditProfilePage} from "../editprofile/editprofile";
import { RegisterPetPage} from "../registerPet/registerPet"
import { User} from "../../model/user";
import {PetInfo} from "../../model/pet";
import { FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import { PictureEditPage } from './pictureEdit';

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  profileData : FirebaseObjectObservable<UserInfo>;
  selectedPet : any;
  petIds : FirebaseListObservable<string[]>;
  userId: any;
  petNames = {}
  imgUrl;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
            private afAuth: AngularFireAuth,
            private db : AngularFireDatabase,
            private modalCtrl: ModalController,
            private app : FirebaseApp) {
              this.userId = this.afAuth.auth.currentUser.uid;
              this.profileData = this.db.object(`users/`+this.userId);
              this.getPetIds();
              this.getImgUrl();
            }

  getImgUrl(){
    this.profileData.forEach(snapshot=>{
      console.log("picture Url = "+ snapshot.pictureURL);
      var gsReference = firebase.storage().refFromURL(snapshot.pictureURL);
      gsReference.getDownloadURL().then(url =>{
        console.log("img url = "+ url);
        this.imgUrl = url;
        document.getElementById("profilePicture").setAttribute("src",url);
      }).catch(function(error){
        console.log("catchin error here");
        let alert = this.alertCtrl.create({
          title: 'Error',
          message : error,
          buttons : ['OK']
        });
        alert.present();
      })
    })
  }

  changePicture(){
    this.navCtrl.push(PictureEditPage,{userId: this.userId, imgUrl : this.imgUrl});
  }

  ionViewDidLoad() {
    console.log("profile page loaded");
  }

  registerNewPet(user: User)
  {
    console.log("In registerNewPet Function");
    this.navCtrl.push('RegisterPetPage',{uid:this.userId});
  }

  accessPet(pet: any) {
    this.navCtrl.push('PetPage',{petId: pet});
  }

  editProfile() {
    var edit = this.modalCtrl.create(EditProfilePage);
    edit.present();
  }

  getPetIds(){
    console.log("get called" + "users/"+this.userId+"/petIds");
    this.petIds = this.db.list("users/"+this.userId+"/petIds");
  }

  getPetName(petId:any):string {
    var petData: FirebaseObjectObservable<PetInfo>;
    var response = '';
    if(this.petNames[petId]== null){
      petData = this.db.object(`pets/` + petId);
      console.log("accessing database for pet name");
      petData.forEach(snapshot => {

        this.petNames[petId]= snapshot.petName;
      });
    }
    response = this.petNames[petId];

    return response;
  }
}
