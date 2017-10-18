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
import * as firebase from 'firebase';
import { MapPage } from './map';

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
  private userData:{[k: string]: UserInfo} = {};
  private petData:{[k: string]: PetInfo} = {};
  private vetData:{[k: string]: UserInfo} = {};
  private vetIds: Array<String>;
  apiUrl = "http://115.146.86.193:8080/";
  User : any
  Vet : any
  userType : any;
  Offline: any;
  Online : any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public db: AngularFireDatabase,
              private af: AngularFireAuth,
              private modalCtrl: ModalController,
              private storage: Storage,
              private alertCtrl: AlertController,
              private httpProviders : HttpServiceProvider) {
    

    var status = this.navParams.get("status");
    if(status == "offline"){

      this.Offline = true;
      this.userType = this.navParams.get("userType");
      if(this.userType == "Vet"){
        this.Vet = true;
        this.getOfflineData();
      }else if(this.userType == "User"){
        this.User = true;
        this.getOfflineData();
      }else{
        console.log("UserType is not valid");
        this.navCtrl.pop();
      }
      

    }else{
      this.Online = true;
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
    
  }

  getOfflineData(){
    this.storage.get("CurrentBookings").then(result=>{
      this.currentBookings = result;
      console.log("result ="+result);
      console.log("currentBooking = "+ this.currentBookings);
    }).catch(error=>{
      this.createAlert(error);
    });

    this.storage.get("PastBookings").then(result=>{
      this.pastBookings = result;
      console.log("result ="+result);
      console.log("currentBooking = "+ this.pastBookings);
    }).catch(error=>{
      this.createAlert(error);
    });
    
    this.storage.get("BookingUserData").then(result=>{
      this.userData = result;
    }).catch(error=>{
      this.createAlert(error);
    });


    this.storage.get("VetUserData").then(result=>{
      this.vetData = result;
    })
    .catch(error=>{
      this.createAlert(error);
    });

    this.storage.get("PetUserData").then(result=>{
      this.petData = result;
    }).catch(error=>{
      this.createAlert(error);
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
    this.vetIds = new Array<string>();
    console.log(snapshot.keys().next().value);
    console.log(JSON.stringify(snapshot));
    for(var i = 0; i < snapshot.length; i++){
      var snap = snapshot[i];
      var booking : BookingInfo = snap;
      if(booking.status == "confirmed"){
        console.log("1 confirmed booking");
        this.currentBookings.push(snap);
        this.vetIds.push(booking.vetId);
      }else if (booking.status == "done"){
        console.log("1 past bookings")
        this.pastBookings.push(snap);
      }
      this.storeBookingData();
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
      this.changeImageUrl(profileData,vetid);
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
    let findNearestVet = this.navCtrl.push(FindNearestVet, {userId: this.userid});
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
      this.createAlert(error);
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
        this.createAlert(err);
    })


    
  }
  
  getImageUrl(vetId: string):string{
    var vet = this.vetData[vetId];
    if(vet!= null){
      var pictureUrl = vet.pictureURL;
      return pictureUrl;
    }else{
      return null;
    }
  }

  changeImageUrl(profileData: UserInfo, vetid: string){
    var pictureURL = profileData.pictureURL;
    console.log(pictureURL);
    var gsReference = firebase.storage().refFromURL(pictureURL);
    gsReference.getDownloadURL().then(url =>{
      console.log("img url = "+ url);
      profileData.pictureURL = url;
      this.vetData[vetid] = profileData;
    }).catch(function(error){
      console.log("catchin error here");
      this.createAlert(error);
    })
  }

  generateAddress(vetId: string): string{
    var vet = this.vetData[vetId];
    if(vet!= null){
      var streetNum = vet.streetnumber;
      var streetNam = vet.streetname;
      var state = vet.state;
      var postcode = vet.postcode;
      var suburb = vet.suburb;
      var country = vet.country;
      return streetNum + " " + streetNam +" , "+ suburb+" , "+state+" "+postcode+" , "+ country;
    }else{
      return null;
    }
  }

  goMap(vetid: string){
    console.log("map button pushed");
    console.log("vet id = " + vetid);
    console.log("vetids =" + this.vetIds);
    console.log("vetdatas = "+ this.vetData);
    this.navCtrl.push(MapPage, {"vetid": vetid, "vetids": this.vetIds, "vetdatas": this.vetData});
    
  }

  createAlert(msg : JSON){
    let alert = this.alertCtrl.create({
      title: 'Error',
      message : JSON.stringify(msg),
      buttons : ['OK']
    });
    alert.present();
  }




}
