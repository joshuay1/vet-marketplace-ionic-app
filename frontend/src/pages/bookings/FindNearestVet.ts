import {Component} from "@angular/core";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {ViewController, NavParams, AlertController, LoadingController, ModalController} from "ionic-angular";
import {HttpServiceProvider} from "../../providers/http-service/http-service";
import {MakeBookingModal} from "./MakeBookingModal";
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {PetInfo} from "../../model/pet";

@Component({
  templateUrl: "FindNearestVet.html"
})

export class FindNearestVet {
  userId: string;
  findVet: FormGroup;
  radius: any;
  time: any;
  date: any;
  vetIds: any;
  consultation: any;
  petIds : Array<any>;
  selectedPet : any;
  apiUrl = "http://115.146.86.193:8080/";


  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              private builder: FormBuilder,
              private alertCtrl: AlertController,
              private httpProviders: HttpServiceProvider,
              public loadingCtrl: LoadingController,
              public db : AngularFireDatabase,
              private modalCtrl: ModalController) {
    this.userId = params.get("userId");
    console.log("user id in find nearest vet = " + this.userId);
    this.findVet = builder.group({
      'date': ['', Validators.required],
      //'radius': ['', Validators.required],
      'time': ['', Validators.required]
    })
    this.getPetIds();
  }

  async search() {
    var hrs = this.time.split(":")[0];
    var param = "&radius=500" + "&date=" + this.date + "&time=" + hrs + ".00";
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    console.log(param);
    this.httpProviders.httpGet(this.apiUrl + "nearestVet", param, JSON.stringify({}))
      .then(result => {
        console.log("result=" + JSON.stringify(result));
        var res = result.response;
        if (res == "success") {
          console.log("success + " + result.hasOwnProperty("vetID"));
          for (var key in result) {
            if (key === "vetID") {
              console.log(result[key]);
              this.vetIds = result[key];
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
    console.log(this.consultation);
    let finalBooking = this.modalCtrl.create(MakeBookingModal, {
      vetIds: this.vetIds,
      userId: this.userId,
      petId : this.selectedPet,
      date: this.date,
      time: this.time
    });
    finalBooking.present();
  }

  getPetIds(){
    console.log("get called");
    var pets = this.db.list("users/"+this.userId+"/petIds",{
    });
    pets.forEach(snapshot=>{
      this.petIds = snapshot;
    });
  }

  getPetName(petId:any):string {
    console.log(petId);
    var petData: FirebaseObjectObservable<PetInfo>;
    petData = this.db.object(`pets/` + petId);
    var response = '';
    petData.forEach(snapshot => {
      response = snapshot.petName;
    });
    return response;
  }
}
