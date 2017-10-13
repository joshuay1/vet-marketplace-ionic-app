import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams, AlertController} from 'ionic-angular';
import {FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserInfo, BookingInfo} from '../../model/user';
import {FindNearestVet} from "./FindNearestVet";
import { PetInfo } from '../../model/pet';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-bookings',
  templateUrl: 'bookings.html',
})
export class BookingsPage {
  userid : string;
  public Bookings: FirebaseListObservable<any[]>;
  public currentBookings : BookingInfo[] = new Array<BookingInfo>();
  public pastBookings : BookingInfo[] = new Array <BookingInfo>();
  apiUrl = "http://115.146.86.193:8080/";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public db: AngularFireDatabase,
              private af: AngularFireAuth,
              private modalCtrl: ModalController,
              private storage: Storage,
              private alertCtrl: AlertController) {


    this.userid = this.af.auth.currentUser.uid;
    this.Bookings = this.db.list("bookings", {
      query: {
        orderByChild: 'userId',
        equalTo: this.userid
      }
    });
    
    this.Bookings.forEach(snapshot=>{
      this.getBooking(snapshot);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookingsPage');
  }

  getBooking(snapshot : any[]) {
    console.log("get called");

    console.log("get Current Booking called");
    this.currentBookings = new Array<BookingInfo> ();
    this.pastBookings = new Array<BookingInfo>();
    console.log(snapshot.keys().next().value);
    console.log(JSON.stringify(snapshot));
    for(var i = 0; i < snapshot.length; i++){
      var snap = snapshot[i];
      var booking : BookingInfo = snap;
      if(booking.status == "confirmed"){
        this.currentBookings.push(snap);
      }else if (booking.status == "done"){
        this.pastBookings.push(snap);
      }
        return false;
    }

      this.storeBookingData();
  }


  stringfy(json: any): string {

    return JSON.stringify(json);
  }

  generateUserData(userid: any): string {
    var profileData: FirebaseObjectObservable<UserInfo>;
    profileData = this.db.object(`users/` + userid);
    var response;
    profileData.forEach(snapshot => {
      response = snapshot.firstname +
        " " + snapshot.lastname
      /*"\n Address = " +snapshot.streetnumber +" " + snapshot.streetname+
      " , " + snapshot.suburb +" , "+ snapshot.state +" "+  snapshot.country*/;

    });
    return response;

  }

  generatePetData(petid: any): string{
    var petData : FirebaseObjectObservable<PetInfo>;
    petData = this.db.object(`pets/`+ petid);
    var response;
    petData.forEach(snapshot =>{
        response = snapshot.petName;
    });

    return response;
}

  makeBooking() {
    let findNearestVet = this.modalCtrl.create(FindNearestVet, {userId: this.userid});
    findNearestVet.present();
  }

  storeBookingData(){
    this.storage.set("CurrentBookings",this.currentBookings).then(result=>{
      console.log("storing currentBookings completed");
      this.storage.set("PastBookings",this.pastBookings).then(result=>{
        console.log("storing pastBookings completed");
      }).catch(error=>{
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: "You have not log in before. No Data Found",
          buttons: ['OK']
        });
          alert.present();
      })
    }).catch(error=>{
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: "You have not log in before. No Data Found",
        buttons: ['OK']
      });
        alert.present();
    })
  }

}
