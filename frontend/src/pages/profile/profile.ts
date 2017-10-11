import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { PetPage} from "../pet/pet";
import { EditProfilePage} from "../editprofile/editprofile";
import { RegisterPetPage} from "../registerPet/registerPet"
import { User} from "../../model/user";
import {PetInfo} from "../../model/pet";

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
  petIds : Array<any>;
  userId: any;
  
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
            private afAuth: AngularFireAuth,
            private db : AngularFireDatabase,
            private modalCtrl: ModalController) {
              this.afAuth.authState.subscribe(data=>{
                this.profileData = this.db.object(`users/${data.uid}`);
                this.userId = `${data.uid}`;
              });          
               
            }

  ionViewDidLoad() {
    console.log("hello");
    this.getPetIds();             
  }

  registerNewPet(user: User)
  {
    console.log("In registerNewPet Function");
    this.navCtrl.push('RegisterPetPage',this.userId);
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
    var pets = this.db.list("users/"+this.userId+"/petIds",{
    });
    pets.forEach(snapshot=>{
      console.log("snaphot is " + snapshot);
      this.petIds = snapshot;
    });
  }

  getPetName(petId:any):string {
    console.log(petId);
    var petData: FirebaseObjectObservable<PetInfo>;
    petData = this.db.object(`pets/` + petId);
    var response = '';
    petData.forEach(snapshot => {
      response = snapshot.petName;
    });
    return response;
  }
}
