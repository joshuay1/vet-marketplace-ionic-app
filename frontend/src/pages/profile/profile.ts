import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
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
import { Storage } from '@ionic/storage';

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

  selectedPet : any;
  petIds :Array<string>;
  userId: any;
  petNames : {[k: string]: any} = {};
  imgUrl;
  profileData : UserInfo;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
            private afAuth: AngularFireAuth,
            private db : AngularFireDatabase,
            private modalCtrl: ModalController,
            private app : FirebaseApp,
            private storage: Storage,
            private alertCtrl : AlertController) {
              this.userId = this.afAuth.auth.currentUser.uid;
              var profile : FirebaseObjectObservable<UserInfo>;
              profile = this.db.object(`users/`+this.userId);
              profile.forEach(snapshot=>{
                this.storeUserData(this.userId);
                this.getImgUrl(snapshot.pictureURL);
                this.petIds = snapshot.petIds;
                this.getPetNames();
              });
              
              
            }


  storeUserData(uid : string){
    this.db.database.ref('/users/'+uid).once('value',(snapshot)=>{
      this.profileData = snapshot.val();
      console.log(JSON.stringify(this.profileData));
      this.storage.set("userData", this.profileData).then(result=>{
        console.log("storing user data successful");
      }).catch(error=>{
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: error,
          buttons: ['OK']
        });
          alert.present();

      });
    });
  }

  getImgUrl(pictureURL: string){
      console.log("picture Url = "+ pictureURL);
      var gsReference = firebase.storage().refFromURL(pictureURL);
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


  getPetName(petId:any):string {
    return this.petNames[petId];
  }

  getPetNames(){
    console.log("accessing database for petNames");
      var petStorage = new Array<PetInfo>();
      var tempDatas = new Array<String>();
      var i = 0;
      var count = 0 ;
      for( i = 0 ; i < this.petIds.length; i++){
        var petId = this.petIds[i];
        this.db.database.ref('/pets/'+petId).once('value',(snapshot)=>{
          
          var petData : PetInfo = snapshot.val();
          console.log(JSON.stringify(petData));
          petStorage.push(petData);
          console.log("petStorage = " + petStorage);
          tempDatas.push(petId +":"+ petData.petName);
          console.log("petData = " + tempDatas);
          count ++;
          console.log(count);
          if(count > this.petIds.length -1){
            this.storePetNames(petStorage, tempDatas);
          }
        })
    
    //at the end store data into storage
  }
}

  storePetNames(petStorage : Array<PetInfo>, petdatas : Array<String>){
    for(var i = 0 ; i < this.petIds.length; i++){
      var tokens = petdatas[i].split(":");
      console.log(petdatas[i]);
      console.log("tokens 1 = " + tokens[0]);
      console.log("tokens 2 = " + tokens[1]);
      this.petNames[tokens[0]]= tokens[1];
      console.log(JSON.stringify(this.petNames)); 
    }
    console.log("petNames = "+ JSON.stringify(this.petNames));
    this.storage.set("PetDatas", petStorage).then(result=>{
      console.log("storing pet data successful");
    }).catch(error=>{

      console.log("catchin error here");
      let alert = this.alertCtrl.create({
        title: 'Error',
        message : error,
        buttons : ['OK']
      });
      alert.present();
    })
  }

}
