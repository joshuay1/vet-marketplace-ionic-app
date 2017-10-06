import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ViewController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/http-service/http-service';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AvailModal } from './availModal';

/**
 * Generated class for the Calendar Page page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  availData : FirebaseListObservable<any[]>

  vetId: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private db: AngularFireDatabase,
              private auth : AngularFireAuth,
              private modalCtrl: ModalController) {
      this.vetId = auth.auth.currentUser.uid;          
      this.availData = db.list("users/"+this.vetId+"/availabilities");
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad Calendar Page');

  }


  stringfy(json: any):string{
    
        return JSON.stringify(json);
  }


  presentAvailPrompt() {
    let availModal = this.modalCtrl.create(AvailModal,{vetId: this.vetId});
    availModal.present();
  }

  

}







