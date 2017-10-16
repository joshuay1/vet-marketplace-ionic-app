import {Component} from "@angular/core";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {ViewController, NavParams, AlertController, LoadingController, ModalController} from "ionic-angular";
import {HttpServiceProvider} from "../../providers/http-service/http-service";
import {MakeBookingModal} from "./MakeBookingModal";
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {PetInfo} from "../../model/pet";
import { UserInfo } from "../../model/user";

@Component({
  templateUrl: "FindNearestVet.html"
})

export class FindNearestVet {
  private userId: string;
  private findVet: FormGroup;
  private radius: any;
  private time: any;
  private date: any;
  private vetIds: Array<string>;
  private consultation: any;
  private petIds : Array<string>;
  private selectedPet : any;
  private apiUrl = "http://115.146.86.193:8080/";
  private petData:{[k: string]: PetInfo} = {};


  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              private builder: FormBuilder,
              private alertCtrl: AlertController,
              private httpProviders: HttpServiceProvider,
              public loadingCtrl: LoadingController,
              public db : AngularFireDatabase,
              private modalCtrl: ModalController) {
    this.userId = params.get("userId");
    this.findVet = builder.group({
      'date': ['', Validators.required],
      //'radius': ['', Validators.required],
      'time': ['', Validators.required]
    })
    this.db.database.ref('/users/'+this.userId+"/petIds").on('value',(snapshot)=>{
      this.petIds = snapshot.val();
      console.log(this.petIds);
    });
      
    this.generatePetData();
  }

  async search() {
    var hrs = this.time.split(":")[0];
    var param = "&radius=500" + "&date=" + this.date + "&time=" + hrs + ".00";
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.httpProviders.httpGet(this.apiUrl + "nearestVet", param, JSON.stringify({}))
      .then(result => {
        console.log("result=" + JSON.stringify(result));
        var res = result.response;
        if (res == "success") {
          console.log("success + " + result.hasOwnProperty("vetID"));
          for (var key in result) {
            if (key === "vetID") {
              this.vetIds = result[key];
              if(this.vetIds== null || this.vetIds.length == 0){
                let alert = this.alertCtrl.create({
                  title: 'There are no vets available at the specified time and date',
                  message: result.errorMessage,
                  buttons: ['OK']
                });
                alert.present();
                this.viewCtrl.dismiss();
              }
            }
          }
          ;
          loading.dismiss();

          if (result["vetID"] == null) {
            console.log("It's null")
            let alert = this.alertCtrl.create({
              title: 'There are no vets available at the specified time and date',
              message: result.errorMessage,
              buttons: ['OK']
            });
            alert.present();
            this.viewCtrl.dismiss();
          } else {
            this.viewCtrl.dismiss();
            this.finalizeBooking();
          }
        } else {
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Error',
            message: result.errorMessage,
            buttons: ['OK']
          });
          alert.present();
        }

      })
      .catch(err => {
        loading.dismiss();
        console.log("error = " + JSON.stringify(err));
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: JSON.stringify(err),
          buttons: ['OK']
        });
        alert.present();
      })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  finalizeBooking() {
    let finalBooking = this.modalCtrl.create(MakeBookingModal, {
      vetIds: this.vetIds,
      userId: this.userId,
      petId : this.selectedPet,
      date: this.date,
      time: this.time
    });
    finalBooking.present();
  }


  generatePetData(){
    for(var i = 0 ; i < this.petIds.length; i++){
      this.addPetData(this.petIds[i]);
    }
  }


  getPetName(petid:any):string {
    var petData : PetInfo;
    petData = this.petData[petid];
    if(petData != null){
      return petData.petName;
    }else{
      return "";
    }
  }

  selectPet(petId:any){
    this.selectedPet = petId;
  }


  addPetData(petId: string){
    this.db.database.ref('/pets/'+petId).once('value',(snapshot)=>{
      var profileData : PetInfo = snapshot.val();
      console.log(JSON.stringify(profileData));
      this.petData[petId]= profileData;
      console.log(JSON.stringify(this.petData));
    });
  }

}
