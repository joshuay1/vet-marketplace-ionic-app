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


  private cleanData: Array<string>;

  private vetId: string;
  private avail : {[k: string]: string} = {};

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private db: AngularFireDatabase,
              private auth : AngularFireAuth,
              private modalCtrl: ModalController) {
      this.vetId = auth.auth.currentUser.uid;          
      var avail = db.list("users/"+this.vetId+"/availabilities");
      this.db.database.ref('/users/'+this.vetId+"/availabilities").on('value',(snapshot)=>{
        var availData = snapshot.val();
        console.log(availData);
        this.sort_and_handle(availData);
      });
  }

  sort_and_handle(availData: Array<any>){
    this.cleanData = new Array<string>();
    for(var i = 0 ; i < availData.length; i++){
      console.log(JSON.stringify(availData[i]));
      var date = Object.keys(availData[i])[0];
      console.log("date = "+ date);
      var time = availData[i][date];
      console.log("time = "+ time);
      this.avail[date] = time;
      this.cleanData.push(date);
    }
    if(this.cleanData.length>0 && this.cleanData != null){
      this.cleanData.sort();
    }
    
  }


  compareDate(dateString1 : string, dateString2 : string):number{

    var date1 : Date = new Date(dateString1);
    var date2 : Date = new Date(dateString2);
    if(date1 < date2){
      return -1;
    }else if(date1 == date2){
      return 0;
    }else{
      return 1;
    }
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

  generateTime(date: string):string{
    var time = this.avail[date];

    return time;
  }

  

}







