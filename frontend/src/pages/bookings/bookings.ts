import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserInfo } from '../../model/user';



@IonicPage()
@Component({
  selector: 'page-bookings',
  templateUrl: 'bookings.html',
})
export class BookingsPage {
    public currentBookings: FirebaseListObservable<any[]>;
    public pastBookings : FirebaseListObservable<any[]>;
    private userid: string;

    constructor(public navCtrl: NavController, 
                public navParams: NavParams,
                public db : AngularFireDatabase,
                private af: AngularFireAuth) {


        this.userid = this.af.auth.currentUser.uid;
        this.getCurrentBooking();
        this.getPastBooking();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookingsPage');
  }

  getCurrentBooking(){
    console.log("get called");
    this.currentBookings = this.db.list("bookings",{
      query:{
        orderByChild: 'userId',
        equalTo: this.userid
      }
    });
    console.log(this.currentBookings);
  }

  getPastBooking(){

    //TODO

  }

  stringfy(json: any):string{

    return JSON.stringify(json);
  }

  generateUserData(userid:any):string{
    var profileData : FirebaseObjectObservable<UserInfo>;
    profileData = this.db.object(`users/`+userid);
    var response;
    profileData.forEach(snapshot=>{
      response =  snapshot.firstname+
                     " " + snapshot.lastname
                     /*"\n Address = " +snapshot.streetnumber +" " + snapshot.streetname+
                     " , " + snapshot.suburb +" , "+ snapshot.state +" "+  snapshot.country*/;
      
    });
    return response;
    
  }

}
