import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams, AlertController} from 'ionic-angular';
import {FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserInfo, BookingInfo} from '../../model/user';
import {FindNearestVet} from "./FindNearestVet";
import { PetInfo } from '../../model/pet';
import { Storage } from '@ionic/storage';
import { HeapModal } from './HeapModal';
import { HttpServiceProvider } from '../../providers/http-service/http-service';

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
  private userData:{[k: string]: any} = {};
  private petData:{[k: string]: any} = {};
  private vetData:{[k: string]: any} = {};
  apiUrl = "http://115.146.86.193:8080/";
  User : any = null;
  Vet : any = null;
  userType : any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public db: AngularFireDatabase,
              private af: AngularFireAuth,
              private modalCtrl: ModalController,
              private storage: Storage,
              private alertCtrl: AlertController,
              private httpProviders : HttpServiceProvider) {
    


    this.userid = this.af.auth.currentUser.uid;
    this.db.database.ref('/users/'+this.userid).once('value',(snapshot)=>{
      var profileData : UserInfo = snapshot.val();
      console.log(JSON.stringify(profileData));
      this.userType = profileData.userType;
      console.log(this.userType);
      if(this.userType == "Vet"){
        this.Vet = true;
        this.Bookings = this.db.list("bookings", {
          query: {
            orderByChild: 'vetId',
            equalTo: this.userid
          }
        });
        this.Bookings.forEach(snapshot=>{
          this.getBooking(snapshot);
        })
      }else if(this.userType == "User"){
        this.User = true;
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
    });
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
        console.log("1 confirmed booking");
        this.currentBookings.push(snap);
      }else if (booking.status == "done"){
        console.log("1 past bookings")
        this.pastBookings.push(snap);
      }
      this.addUserData(booking.userId);
      this.addVetData(booking.vetId);
      this.addPetData(booking.petId);
    }

      
  }

  addUserData(userid: string){
    this.db.database.ref('/users/'+userid).on('value',(snapshot)=>{
      var profileData : UserInfo = snapshot.val();
      console.log(JSON.stringify(profileData));
      this.userData[userid]= profileData;
      console.log(JSON.stringify(this.userData));
      this.storeUserData();
    });
  }

  storeUserData(){
    this.storage.set("BookingUserData", this.userData).then(result=>{
      console.log(JSON.stringify(this.userData));
      console.log("storing user data completed");
    })
  }

  
  

  addVetData(vetid : string){
    this.db.database.ref('/users/'+vetid).on('value',(snapshot)=>{
      var profileData : UserInfo = snapshot.val();
      console.log(JSON.stringify(profileData));
      this.vetData[vetid]= profileData;
      console.log(JSON.stringify(this.vetData));
      this.storeVetData();
    });
  }

  storeVetData(){
    this.storage.set("VetUserData",this.vetData).then(result=>{
      console.log(JSON.stringify(this.vetData));
      console.log("storing vet data completed");
    })
  }


  addPetData(petId: string){
    this.db.database.ref('/pets/'+petId).on('value',(snapshot)=>{
      var profileData : PetInfo = snapshot.val();
      console.log(JSON.stringify(profileData));
      this.petData[petId]= profileData;
      console.log(JSON.stringify(this.petData));
      this.storePetData();
    });
  }

  storePetData(){
    this.storage.set("PetUserData",this.petData).then(result=>{
      console.log(JSON.stringify(this.petData));
      console.log("storing pet data completed");
    })
  }


  stringfy(json: any): string {

    return JSON.stringify(json);
  }

  generateUserData(userid: any): string {
    var profileData: UserInfo;
    profileData = this.userData[userid];
    if(profileData!=null){
      return profileData.firstname +
      " " + profileData.lastname
    }else{
      return "";
    }
  }

  generatePetData(petid: any): string{
    var petData : PetInfo;
    petData = this.petData[petid];
    if(petData != null){
      return petData.petName;
    }else{
      return "";
    }
}

  generateVetData(vetid:any) : string{
    var vetData : UserInfo;
    vetData = this.vetData[vetid];
    if(vetData!= null){
      return vetData.firstname +
      " " + vetData.lastname
    }else{
      return "";
    }
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

  goToHeap(book: BookingInfo){
    console.log("sending to HeapModal = "+ JSON.stringify(book));
    const modal = this.modalCtrl.create(HeapModal, { "BookingInfo": book});
    modal.present();
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
        });                
        alert.present();
    })


    
  }



}
