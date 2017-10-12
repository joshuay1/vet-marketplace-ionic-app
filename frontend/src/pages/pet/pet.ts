import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import {PetInfo} from "../../model/pet";

/**
 * Generated class for the PetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pet',
  templateUrl: 'pet.html',
})
export class PetPage {
  petData : FirebaseObjectObservable<PetInfo>;
  petId : any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
  private afAuth: AngularFireAuth,
  private db : AngularFireDatabase,
  private modalCtrl: ModalController) {
    this.afAuth.authState.subscribe(data=>{
      this.petId = navParams.get('petId');
      this.petData = this.db.object(`pets/`+this.petId);
    });           
  }

  editPet() {
    this.navCtrl.push('EditPetPage',{petId: this.petId});    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PetPage');
  }

}
