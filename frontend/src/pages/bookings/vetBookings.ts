import { NavController, NavParams, ModalController } from "ionic-angular";
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";

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
            orderByChild: 'userId',
            equalTo: this.userid
          }
        });
        console.log(this.currentBookings);
      }

    getPastBooking(){
          
    }
}