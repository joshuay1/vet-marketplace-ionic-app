import { NavController, NavParams, ModalController, IonicPage } from "ionic-angular";
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Component } from "@angular/core";
import { UserInfo, BookingInfo } from "../../model/user";
import { PetInfo } from "../../model/pet";

@IonicPage()
@Component({
  selector: 'page-vetBookings',
  templateUrl: 'vetBookings.html',
})
export class VetBookingsPage {
    userid : string;
    public currentBookings: FirebaseListObservable<any[]>;
    public pastBookings : FirebaseListObservable<any[]>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public db : AngularFireDatabase,
        private af: AngularFireAuth,
        private modalCtrl : ModalController) {


        this.userid = this.af.auth.currentUser.uid;
        this.getCurrentBooking();
        this.getPastBooking();
        
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad VetBookingsPage');
      }

    getCurrentBooking(){
        console.log("get Current Booking called");
        this.currentBookings = this.db.list("bookings",{
          query:{
            orderByChild: 'vetId',
            equalTo: this.userid
          }
        });

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
      

    getPastBooking(){
          
    }
}
