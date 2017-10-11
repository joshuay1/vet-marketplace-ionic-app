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
    public Bookings: FirebaseListObservable<any[]>;
    public currentBookings : BookingInfo[] = new Array<BookingInfo>();
    public pastBookings : BookingInfo[] = new Array <BookingInfo>();
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public db : AngularFireDatabase,
        private af: AngularFireAuth,
        private modalCtrl : ModalController) {


        this.userid = this.af.auth.currentUser.uid;
        this.Bookings = this.db.list("bookings",{
          query:{
            orderByChild: 'vetId',
            equalTo: this.userid
          }
        });
        this.getBooking();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad VetBookingsPage');
      }

    getBooking(){
        console.log("get Current Booking called");
        this.currentBookings = new Array<BookingInfo> ();
        this.pastBookings = new Array<BookingInfo>();
        this.Bookings.forEach(snapshot=>{
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

          confirm(bookingId: string ){
            console.log("sending request for booking id " + bookingId);
            //HTTP REQUEST to make booking done;

            this.getBooking();
          }
      
}
