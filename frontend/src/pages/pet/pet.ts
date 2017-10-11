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
  petID : any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
  private afAuth: AngularFireAuth,
  private db : AngularFireDatabase,
  private modalCtrl: ModalController) {
    this.afAuth.authState.subscribe(data=>{
      this.petID = navParams.get('petId');
      this.petData = this.db.object(`pets/`+this.petID);
    });           
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PetPage');
  }

}
