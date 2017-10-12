import { NavController, NavParams, ModalController, IonicPage, AlertController } from "ionic-angular";
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Component } from "@angular/core";
import { UserInfo, BookingInfo } from "../../model/user";
import { PetInfo } from "../../model/pet";
import { HttpServiceProvider } from "../../providers/http-service/http-service";
import { HeapModal } from "./HeapModal";

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
    apiUrl = "http://115.146.86.193:8080/";

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public db : AngularFireDatabase,
        private af: AngularFireAuth,
        private modalCtrl : ModalController,
        private httpProviders : HttpServiceProvider,
        private alertCtrl: AlertController) {


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

    goToHeap(book: BookingInfo){
      console.log("sending to HeapModal = "+ JSON.stringify(book));
      const modal = this.modalCtrl.create(HeapModal, { "BookingInfo": book});
      modal.present();
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
            var body = {"userid": this.userid, "bookingId": bookingId};
            //HTTP REQUEST to make booking done;
            this.httpProviders.httpPost(this.apiUrl + "completeBooking", JSON.stringify(body))
            .then(result => {
                console.log("get result here");
                console.log("result = "+ JSON.stringify(result));
                var res = result.response;
                if (res == "success") {
                  console.log("successful change");
                  
                }
            }).catch(err => {
                console.log("catching error here");
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: err,
                    buttons: ['OK']
                });                 alert.present();
            })


            
          }
      
}
