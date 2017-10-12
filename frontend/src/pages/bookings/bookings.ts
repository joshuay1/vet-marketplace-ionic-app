import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserInfo, BookingInfo} from '../../model/user';
import {FindNearestVet} from "./FindNearestVet";
import { PetInfo } from '../../model/pet';

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
              private modalCtrl: ModalController) {


    this.userid = this.af.auth.currentUser.uid;
    this.Bookings = this.db.list("bookings", {
      query: {
        orderByChild: 'userId',
        equalTo: this.userid
      }
    });
    this.getBooking();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookingsPage');
  }

  getBooking() {
    console.log("get called");

    console.log("get Current Booking called");
    
    this.Bookings.forEach(snapshot=>{
      this.currentBookings = new Array<BookingInfo> ();
      this.pastBookings = new Array<BookingInfo>();
      console.log(snapshot.keys().next().value);
      console.log(JSON.stringify(snapshot));
      snapshot.forEach(snap =>{
        var booking : BookingInfo = snap;
        if(booking.status == "confirmed"){
          this.currentBookings.push(snap);
        }else if (booking.status == "done"){
          this.pastBookings.push(snap);
        }
        return false;
        
      });

    })
    
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

}
